# Arabic versions: how to continue in a new session

1. The Gemini key must be an environment variable named `GEMINI_API_KEY`. Environment secrets reach new sessions only.
2. Set up the kit: copy `marketing/videos/kit/` to a work folder, create the venv (`python3 -m venv kenv && ./kenv/bin/pip install kokoro-onnx soundfile numpy`), and download the Kokoro model files listed in `kit/AGENT-PROMPT.md`. Kokoro is still needed for the music and effects pipeline, not for the Arabic voices.
3. Recapture the screenshots with `projects/cap.mjs` and `projects/cap2.mjs`, then `python3 projects/make.py`.
4. For each region, copy `arabic/script-<region>-ar.json` to `<region>-ar/script.json`, run `vo_gemini.py`, then `lib/timeline.py`, `lib/music.py` and `lib/data.py`.
5. Config: reuse the English region config, with captions and headlines in Arabic and right to left (add `direction:rtl` and an Arabic font such as Cairo or IBM Plex Sans Arabic to `#cap` and `#head`), plus the Arabic disclaimer from `Arabic-scripts-for-review.md`.
6. Render with `lib/both.sh`. Have a native Arabic-speaking nurse review the audio and text before posting.
