"""
Canopy height from a dropped drone or satellite image (Meta CHMv2).

CHMv2 is a DPT decoder on a DINOv3 ViT-L/16 satellite backbone, published as
`facebook/dinov3-vitl16-chmv2-dpt-head`. It is not run inside this process:
the weights are gated behind Meta's DINOv3 licence, the backbone is ViT-L, and
inference wants a GPU. Flask stays a thin client and the model lives behind an
inference endpoint — in practice a Hugging Face Space with GPU hardware.

This module does the two things that must happen on our side:

  1. RESAMPLE TO A CHOSEN GROUND SAMPLE DISTANCE. This is the substantive
     step, not a convenience. CHMv2 was trained on satellite imagery, so a
     3 cm/px drone orthomosaic is far outside its training distribution —
     at that scale individual leaves fill the receptive field and the decoder
     has never seen anything like it. Downsampling the drone image to roughly
     the GSD the model was trained at is what makes the prediction meaningful.
     The endpoint therefore takes the source GSD and a target GSD and resamples
     before the image ever reaches the model.

  2. CONVERT THE PREDICTION TO GROUND UNITS. The model returns a per-pixel
     height raster; area per pixel follows from the target GSD, which is how
     canopy cover and a tree-count estimate fall out of the same result.

Configure with:
    CHM_INFERENCE_URL   base URL of the Space, e.g. https://user-space.hf.space
    HF_TOKEN            Hugging Face token, sent as a bearer credential

Gradio 4 dropped the single-shot /run/predict endpoint and Gradio 5 moved the
REST API under /gradio_api. A call is now two steps — POST
/gradio_api/call/<fn> returns an event id, then GET
/gradio_api/call/<fn>/<id> streams the result as server-sent events — which
is what _call_inference below implements. Verified against the Space's own
/gradio_api/info, which lists /predict as its named endpoint. A non-Gradio
endpoint can still be used by giving a URL that already ends in a path, in
which case it is POSTed to directly.

Without those this endpoint reports that inference is not configured. It never
fabricates a height map.
"""
import base64
import io
import json
import logging
import math
import os
import time

from urllib.parse import urlparse

import requests
from flask import Blueprint, jsonify, request

logger = logging.getLogger(__name__)
chm_image_bp = Blueprint("chm_image", __name__)

# The resolution ladder, centimetres per pixel. A scene is predicted at every
# rung at or coarser than its own capture resolution, so a 3 cm or 10 cm drone
# mosaic runs all four, a 20 cm capture runs three, and a 50 cm capture runs
# two. Rungs finer than the capture are never offered — upsampling would invent
# ground detail that was never observed.
ALLOWED_GSD_CM = [10, 20, 50, 100]

# CHMv2's backbone is DINOv3 ViT-L/16 trained on satellite imagery. Meta's
# published canopy height products are 1 m; the v1 aerial decoder was trained
# near 0.5 m. Anything finer is extrapolation, so the UI is told to say so.
MODEL_NATIVE_GSD_CM = 100

# What the product calls this pipeline, and what actually produces the raster.
# Sylithe's contribution is the resampling, the multi-resolution comparison and
# the conversion to ground units; the weights are Meta's and stay attributed,
# both because the DINOv3 licence expects it and because a reviewer who spots
# an unattributed foundation model stops trusting everything else on the page.
PIPELINE_NAME = "Sylithe CHM v2"
BASE_MODEL_ID = "facebook/dinov3-vitl16-chmv2-dpt-head"
BASE_MODEL_LABEL = "Meta CHMv2 · DINOv3 ViT-L/16"

MAX_UPLOAD_MB = 25
MAX_EDGE_PX = 4096          # guard against a full orthomosaic being posted
MIN_EDGE_PX = 64

INFERENCE_URL = os.environ.get("CHM_INFERENCE_URL", "").strip()
HF_TOKEN = os.environ.get("HF_TOKEN", "").strip()


def _resample(img, source_gsd_cm, target_gsd_cm):
    """Resample so one output pixel covers `target_gsd_cm` on the ground.

    Downsampling uses LANCZOS, which averages across the pixels being merged —
    the point is to synthesise what a coarser sensor would have recorded, so
    detail must be integrated rather than dropped. Upsampling is refused: it
    invents ground detail that was never observed and would make the model's
    output look more precise than the input supports.
    """
    from PIL import Image

    if target_gsd_cm < source_gsd_cm:
        raise ValueError(
            f"Cannot upsample from {source_gsd_cm} cm/px to {target_gsd_cm} cm/px. "
            "Choose a target at or coarser than the image's own resolution."
        )
    factor = source_gsd_cm / target_gsd_cm      # <= 1 when coarsening
    w = int(round(img.width * factor))
    h = int(round(img.height * factor))
    # Aspect ratio is never altered: the scene's ground extent is fixed, so
    # squaring it would misreport what was photographed. A scene that falls
    # below the model's usable size is reported as too small instead.
    if min(w, h) < MIN_EDGE_PX:
        raise ValueError(
            f"At {target_gsd_cm} cm/px this scene becomes {w}x{h} px, below the {MIN_EDGE_PX} px "
            f"minimum. It covers about {img.width * source_gsd_cm / 100:.0f}x"
            f"{img.height * source_gsd_cm / 100:.0f} m — choose a finer target resolution."
        )
    if (w, h) == img.size:
        return img, False
    return img.resize((w, h), Image.LANCZOS), True


def _headers():
    h = {"Content-Type": "application/json"}
    if HF_TOKEN:
        h["Authorization"] = f"Bearer {HF_TOKEN}"
    return h


def _unwrap(payload):
    """Gradio wraps results as {"data": [...]}; a bare endpoint may not."""
    if isinstance(payload, dict) and "data" in payload:
        payload = payload["data"]
    while isinstance(payload, list) and payload:
        payload = payload[0]
    return payload


def _call_inference(data):
    """Call the endpoint, using Gradio's two-step API when given a Space base URL."""
    base = INFERENCE_URL.rstrip("/")

    # A URL with its own path is treated as a plain single-POST endpoint.
    if urlparse(base).path not in ("", "/"):
        r = requests.post(base, json={"data": data}, headers=_headers(), timeout=180)
        r.raise_for_status()
        return _unwrap(r.json())

    # Gradio 5/6 serve the REST API under /gradio_api. POST for an event id,
    # then read the SSE stream for the result.
    api = f"{base}/gradio_api"
    start = requests.post(f"{api}/call/predict", json={"data": data},
                          headers=_headers(), timeout=60)
    start.raise_for_status()
    event_id = (start.json() or {}).get("event_id")
    if not event_id:
        raise RuntimeError("Gradio did not return an event id — check the Space is running.")

    stream = requests.get(f"{api}/call/predict/{event_id}",
                          headers=_headers(), stream=True, timeout=300)
    stream.raise_for_status()

    event = None
    for raw in stream.iter_lines(decode_unicode=True):
        if not raw:
            continue
        if raw.startswith("event:"):
            event = raw.split(":", 1)[1].strip()
        elif raw.startswith("data:"):
            body = raw.split(":", 1)[1].strip()
            if event == "error":
                raise RuntimeError(f"Inference failed on the Space: {body[:200]}")
            if event == "complete":
                return _unwrap(json.loads(body))
    raise RuntimeError("Inference stream ended before returning a result.")



def _derive(result, target_gsd_cm, input_px):
    """Turn one Space result into ground units for a given resolution."""
    stats = (result or {}).get("stats") or {}
    px_area_m2 = (target_gsd_cm / 100.0) ** 2
    canopy_px = stats.get("canopy_pixels")
    total_px = stats.get("total_pixels") or (input_px[0] * input_px[1])
    derived = {}
    if canopy_px is not None and total_px:
        canopy_m2 = float(canopy_px) * px_area_m2
        derived["canopy_area_m2"] = round(canopy_m2, 1)
        derived["canopy_pct"] = round(float(canopy_px) / float(total_px) * 100, 1)
        mean_h = stats.get("mean_height_m") or 0
        if mean_h and mean_h > 0:
            crown_d = 1.2 * math.sqrt(mean_h)
            crown_area = math.pi * (crown_d / 2) ** 2
            if crown_area > 0:
                derived["estimated_trees"] = int(round(canopy_m2 / crown_area))
                derived["mean_crown_diameter_m"] = round(crown_d, 1)
    return stats, derived


@chm_image_bp.route("/infer-image", methods=["POST", "OPTIONS"])
def infer_image():
    """Predict canopy height for an uploaded drone or satellite image."""
    if request.method == "OPTIONS":
        return jsonify({}), 200

    from PIL import Image

    upload = request.files.get("image")
    if upload is None:
        return jsonify({"status": "error", "message": "No image uploaded."}), 400

    try:
        target_gsd_cm = int(request.form.get("target_gsd_cm") or MODEL_NATIVE_GSD_CM)
        source_gsd_cm = float(request.form.get("source_gsd_cm") or 0)
    except (TypeError, ValueError):
        return jsonify({"status": "error", "message": "Resolution values must be numeric."}), 400

    if target_gsd_cm not in ALLOWED_GSD_CM:
        return jsonify({"status": "error",
                        "message": f"target_gsd_cm must be one of {ALLOWED_GSD_CM}."}), 400

    blob = upload.read()
    if len(blob) > MAX_UPLOAD_MB * 1024 * 1024:
        return jsonify({"status": "error",
                        "message": f"Image is larger than {MAX_UPLOAD_MB} MB."}), 413

    try:
        img = Image.open(io.BytesIO(blob))
        img.load()
        img = img.convert("RGB")
    except Exception as e:
        return jsonify({"status": "error", "message": f"Could not read that image: {e}"}), 400

    original_size = img.size
    if max(original_size) > MAX_EDGE_PX:
        img.thumbnail((MAX_EDGE_PX, MAX_EDGE_PX), Image.LANCZOS)

    # Without a stated source GSD the image cannot be resampled meaningfully,
    # so it is passed through and the response says the target was not applied.
    resampled = False
    note = None
    if source_gsd_cm > 0:
        try:
            img, resampled = _resample(img, source_gsd_cm, target_gsd_cm)
        except ValueError as e:
            return jsonify({"status": "error", "message": str(e)}), 400
    else:
        note = ("Source resolution not given, so the image was sent at its own scale. "
                "Enter the capture GSD to resample to the selected target.")

    extrapolating = target_gsd_cm < MODEL_NATIVE_GSD_CM
    ground = {
        "target_gsd_cm": target_gsd_cm,
        "source_gsd_cm": source_gsd_cm or None,
        "resampled": resampled,
        "model_native_gsd_cm": MODEL_NATIVE_GSD_CM,
        "extrapolating_below_native": extrapolating,
        "input_px": list(img.size),
        "original_px": list(original_size),
        # Ground extent is a property of the capture, so it is derived from the
        # original pixel count and source GSD. Deriving it from the resampled
        # raster would let rounding change how much land we claim was covered.
        "ground_coverage_m": (
            [round(original_size[0] * source_gsd_cm / 100, 1),
             round(original_size[1] * source_gsd_cm / 100, 1)]
            if source_gsd_cm > 0 else None
        ),
        "note": note,
    }

    if not INFERENCE_URL:
        return jsonify({
            "status": "not_configured",
            "message": ("Canopy height inference is not connected. Deploy CHMv2 to a Hugging Face "
                        "Space and set CHM_INFERENCE_URL to its base URL in the backend "
                        "environment."),
            "model": PIPELINE_NAME,
            "base_model": BASE_MODEL_ID,
            "ground": ground,
        }), 503

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    payload_b64 = base64.b64encode(buf.getvalue()).decode()

    started = time.time()
    try:
        result = _call_inference([payload_b64, target_gsd_cm])
    except Exception as e:
        logger.error("CHM inference failed: %s", e)
        return jsonify({"status": "error", "message": str(e)}), 502
    elapsed = round(time.time() - started, 2)

    if not isinstance(result, dict):
        return jsonify({"status": "error",
                        "message": "Inference endpoint returned an unexpected payload shape."}), 502

    stats, derived = _derive(result, target_gsd_cm, list(img.size))

    return jsonify({
        "status": "success",
        "elapsed_s": elapsed,
        "model": PIPELINE_NAME,
        "base_model": BASE_MODEL_ID,
        "base_model_label": BASE_MODEL_LABEL,
        "ground": ground,
        "stats": stats,
        "derived": derived,
        "height_map_png": result.get("height_map_png"),
        "caveat": ("Indicative. CHMv2 is trained on satellite imagery; predictions on drone "
                   "orthomosaics resampled below the model's native scale are extrapolation "
                   "and should be checked against field measurements."
                   if extrapolating else
                   "Indicative. Verify against field measurements before use in a claim."),
    }), 200
