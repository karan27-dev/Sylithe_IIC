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
