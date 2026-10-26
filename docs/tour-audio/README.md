# Tour audio (voiceovers, music, sound effects)

The one-minute app tours on the home page (`site/assets/js/tour.js`, data in `site/assets/js/tours-data.js`) play:

- **Voiceovers** — `site/assets/audio/tour/<app>/<n>.mp3`, one clip per scene (hook, title, scenes…, end).
  Rendered with the open **Kokoro-82M** text-to-speech model (Apache-2.0) via `kokoro-onnx`, weights from the npm
  package `kokoro-q8-shards` and voice styles from `kokoro-js`. Script: `render.py`.
  Voices: MedLex `af_bella` (bright), Carecraft `bf_emma` (warm British), Serein `af_nicole`+`af_heart` (soft, slow),
  Lumen `af_heart` (friendly), Gulf Region `am_michael`+`am_fenrir` with phoneme shaping for a Saudi-accented English
  (tapped r, full vowels), Evinca `bm_george` (documentary), Lean Six Sigma `bm_fable`+`bm_george` (confident coach).
- **Music** — `site/assets/audio/music/<app>.mp3`, ~60 s seamless loops composed and synthesised from scratch in
  `music.py` (numpy only, no samples), so they are original and free to use. Gulf Region uses maqam Hijaz with an
  oud-like plucked string and frame drum; Serein is ambient pads and bells; Lumen is lo-fi; Lean Six Sigma is
  pulsing tech; Evinca is cinematic.
- **Sound effects** — `site/assets/audio/sfx/` (whoosh, chime, tick, pop, rise), also synthesised in `music.py`.

To change narration: edit the `say…` lines in `tours-data.js`, extract them to `lines.json` (see the node one-liner in
the commit that added this folder) and run `python render.py <app>`. For a human narrator, replace the MP3s with
recordings using the same file names.
