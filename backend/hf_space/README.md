---
title: CHMv2 Canopy Height
emoji: 🌳
colorFrom: green
colorTo: gray
sdk: gradio
sdk_version: 4.44.0
app_file: app.py
pinned: false
---

# CHMv2 canopy height inference

Wraps `facebook/dinov3-vitl16-chmv2-dpt-head` — a DPT decoder on a DINOv3
ViT-L/16 satellite backbone — behind a JSON endpoint the Sylithe backend calls.

## Setup

1. **Accept the licence.** Open the model page and agree to the DINOv3 terms.
   The weights are gated; without this `from_pretrained` returns 401.
2. **Set the `HF_TOKEN` secret** on this Space, using a token from the account
   that accepted the licence (Settings → Variables and secrets).
3. **Use GPU hardware.** ViT-L on CPU is impractically slow.

## Confirmed from the published config

    architecture   CHMv2ForDepthEstimation, DINOv3 ViT-L/16 backbone (patch 16)
    max_depth      96 m — the head predicts canopy height in metres
    do_resize      false — the processor only pads to a multiple of 16 and
                   keeps aspect ratio, so the image reaches the ViT at its own
                   pixel size. Ground sample distance is therefore the real
                   control over what the model sees.
    normalization  mean [0.42, 0.411, 0.296], std [0.213, 0.156, 0.143]
                   (satellite statistics, not ImageNet)

Because nothing is resized away, a large orthomosaic goes to the GPU at full
size. The Space caps input at ~4 MP and reports the downscale factor it used.

## Contract

Request  `{"data": ["<base64 PNG>", <target_gsd_cm>]}`
Response `{"data": [{"stats": {...}, "height_map_png": "<base64 PNG>"}]}`

`stats` carries mean/max/p95/sd height in metres, canopy and total pixel counts,
and canopy area in m² derived from the supplied ground sample distance.

## Connecting Sylithe

In the backend environment:

```
CHM_INFERENCE_URL=https://<user>-<space>.hf.space/run/predict
HF_TOKEN=hf_...        # only for a private Space
```
