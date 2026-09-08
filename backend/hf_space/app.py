"""
CHMv2 canopy height inference — Hugging Face Space.

Deploy this to a GPU Space, then point the Sylithe backend at it:

    CHM_INFERENCE_URL = https://<user>-<space>.hf.space/run/predict
    HF_TOKEN          = hf_...        (only needed for a private Space)

The model — facebook/dinov3-vitl16-chmv2-dpt-head — is a DPT decoder on a
DINOv3 ViT-L/16 satellite backbone. It is GATED: accept the DINOv3 licence on
the model page with the same account whose token is set as the HF_TOKEN secret
here, or from_pretrained will 401.

Input contract matches what backend/routes/chm_image.py sends:
    {"data": [<base64 PNG>, <target_gsd_cm>]}
Output:
    {"data": [{"stats": {...}, "height_map_png": "<base64>"}]}
"""
import base64
import io
import os

import gradio as gr
import numpy as np
import torch
from PIL import Image
from transformers import CHMv2ForDepthEstimation, CHMv2ImageProcessorFast

MODEL_ID = "facebook/dinov3-vitl16-chmv2-dpt-head"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
DTYPE = torch.float16 if DEVICE == "cuda" else torch.float32

# Height below which a pixel is not treated as canopy, metres.
MIN_TREE_HEIGHT_M = 2.0

# From the published config: the head predicts height in metres up to this cap.
MAX_DEPTH_M = 96.0

# The processor sets do_resize=false and only pads to a multiple of 16, keeping
# aspect ratio. The image therefore reaches the ViT at its own pixel size —
# which is why the caller's ground-sample-distance choice is the real control
# over what the model sees, and why a large mosaic must be capped here or it
# will exhaust VRAM. ~4 megapixels is comfortable on a T4.
MAX_PIXELS = 4_000_000

_token = os.environ.get("HF_TOKEN")
processor = CHMv2ImageProcessorFast.from_pretrained(MODEL_ID, token=_token)
model = CHMv2ForDepthEstimation.from_pretrained(MODEL_ID, token=_token).to(DEVICE, DTYPE).eval()


def _colourise(height, vmax):
    """Height raster -> RGB, pale green (low) through dark green to near-black."""
    h = np.clip(height / max(vmax, 1e-6), 0, 1)
    r = (0.78 - 0.72 * h) * 255
    g = (0.98 - 0.66 * h) * 255
    b = (0.72 - 0.62 * h) * 255
    rgb = np.stack([r, g, b], axis=-1).astype(np.uint8)
    rgb[height < MIN_TREE_HEIGHT_M] = (32, 32, 32)   # below-canopy ground
    return Image.fromarray(rgb)


@torch.inference_mode()
def predict(image_b64: str, target_gsd_cm: float):
    img = Image.open(io.BytesIO(base64.b64decode(image_b64))).convert("RGB")

    # Guard VRAM. Downscaling here changes the effective ground sample distance,
    # so the factor is reported back rather than silently applied.
    downscale = 1.0
    if img.width * img.height > MAX_PIXELS:
        downscale = (MAX_PIXELS / (img.width * img.height)) ** 0.5
        img = img.resize((max(64, int(img.width * downscale)),
                          max(64, int(img.height * downscale))), Image.LANCZOS)
        target_gsd_cm = float(target_gsd_cm) / downscale

    inputs = processor(images=img, return_tensors="pt").to(DEVICE, DTYPE)
    outputs = model(**inputs)
    post = processor.post_process_depth_estimation(outputs, target_sizes=[(img.height, img.width)])
    height = post[0]["predicted_depth"].float().cpu().numpy()
    height = np.clip(height, 0.0, MAX_DEPTH_M)

    canopy = height >= MIN_TREE_HEIGHT_M
    canopy_px = int(canopy.sum())
    total_px = int(height.size)
    px_area_m2 = (float(target_gsd_cm) / 100.0) ** 2

    stats = {
        "mean_height_m": round(float(height[canopy].mean()), 2) if canopy_px else 0.0,
        "max_height_m": round(float(height.max()), 2),
        "p95_height_m": round(float(np.percentile(height[canopy], 95)), 2) if canopy_px else 0.0,
        "sd_height_m": round(float(height[canopy].std()), 2) if canopy_px else 0.0,
        "canopy_pixels": canopy_px,
        "total_pixels": total_px,
        "canopy_area_m2": round(canopy_px * px_area_m2, 1),
        "target_gsd_cm": round(float(target_gsd_cm), 2),
        "effective_downscale": round(downscale, 4),
        "input_px": [img.width, img.height],
    }

    buf = io.BytesIO()
    _colourise(height, max(float(height.max()), 1.0)).save(buf, format="PNG")
    return {"stats": stats, "height_map_png": base64.b64encode(buf.getvalue()).decode()}


demo = gr.Interface(
    fn=predict,
    inputs=[gr.Textbox(label="Base64 PNG"), gr.Number(label="Target GSD (cm/px)", value=100)],
    outputs=gr.JSON(label="Canopy height"),
    title="CHMv2 canopy height",
    description="DINOv3 ViT-L/16 + DPT decoder. Send a base64 PNG and the ground sample distance.",
)

if __name__ == "__main__":
    demo.launch()
