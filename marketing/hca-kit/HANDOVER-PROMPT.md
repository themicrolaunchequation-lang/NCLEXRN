# Handover prompt (paste this as the first message in the new account)

You are taking over marketing work for **Healthcare Crown Academy (HCA)** from another Claude session. Everything is in GitHub: repository `themicrolaunchequation-lang/NCLEXRN`, branch `claude/hca-publishing-kit`, folder `marketing/hca-kit/`.

**Start by reading, in this order:**
1. `marketing/hca-kit/README.md`: a map of the folder.
2. `marketing/hca-kit/video-pipeline/kit/AGENT-PROMPT.md`: how the videos are made and how to re-make or edit them.
3. `marketing/hca-kit/video-pipeline/GULF-VIDEO-PLAN.md`: the plan for the 5 Gulf videos (on hold).
4. `marketing/hca-kit/publishing-pack/build.py` and `data.py`: they hold all video titles, post copy, links and platform rules.

Then reply with a short summary of what you found. Don't change anything until I ask.

## The apps
Lean Six Sigma for Healthcare, MedLex, Carecraft, Serein, Lumen, Gulf Region Nursing (SNLE/DHA/DOH/DHP) and Evinca. App names, links, hashtags and audiences are in `publishing-pack/data.py` (`APPS`).

## What's done
- 45 finished promo videos in `video-pipeline/out/` (3 or more per app, portrait 9:16 and landscape 16:9, AI voices, original music, captions). The other account's videos are in `marketing/videos/`.
- A publishing pack:
  - paste-ready copy per platform (YouTube, Facebook, LinkedIn) and per app;
  - SEO and keyword research (`kw.json`, from vidIQ);
  - a 94-page guide PDF (`HCA-Social-Publishing-Guide.pdf`).
- LinkedIn thumbnails named exactly like their videos: `publishing-pack/thumbs2/<App>/`, and zipped per app in `tz2/`.
- LinkedIn schedule CSVs in `publishing-pack/csv/`:
  - **Healthcare Crown Academy page:** 33 posts, Tue/Wed/Thu at 09:00 Asia/Riyadh, from 10 Nov 2026.
  - **Lean Six Sigma page:** 5 posts, Wednesdays at 10:00, from 11 Nov 2026.
  - `Buffer-*.csv` are in Buffer's format (Text, Image URL, Tags, Posting Time).
  - **Buffer limits:** bulk upload can't attach videos, and the free plan allows only 10 queued posts per channel.

## Where things stand
- YouTube videos are uploaded and saved for later set-up. Facebook and LinkedIn are being scheduled.
- **Next likely task:** help me schedule the LinkedIn posts (Buffer, or LinkedIn's own scheduler), and adapt the CSV if the tool asks for different columns.
- **Gulf 5-video plan:** don't start it unless I ask.

## Rules (always follow)
- UK English. Accessible design (WCAG AA).
- **No discount or promo codes** in any content.
- Always say "LSS" out loud as "Lean Six Sigma" in voice-overs.
- Mark AI voices: add "Voices are AI-generated." to descriptions.
- Never put Cloudflare, GitHub, Supabase or Stripe secrets in prompts, files or commits.
- **Ask me first before you:**
  - merge into `main`;
  - change production DNS;
  - disable Netlify;
  - make any real payment;
  - change live database records, payment plans, webhook secrets or billing.
- Plan first and wait for my "go" on big jobs. Keep your updates short and simple.

## Not in the repository
The voice model files are too big for GitHub. Re-download `kokoro-v1.0.onnx` and `voices-v1.0.bin` (kokoro-onnx v1.0 release), then `pip install kokoro-onnx` in a virtual environment. You need them only if you re-make videos.
