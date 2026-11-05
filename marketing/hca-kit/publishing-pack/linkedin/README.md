# LinkedIn: what is scheduled, and how

Everything below is **already scheduled in Buffer** and publishes automatically.
There is nothing to paste by hand.

## How it works now

- Buffer holds all 51 posts across the two LinkedIn pages.
- Buffer **fetches each video from this repository** at publish time, over its
  raw.githubusercontent.com URL on the `claude/hca-publishing-kit` branch.
- The app link is scheduled as the post's **first comment**, so nobody has to
  paste it when a post goes live.

## Do not break the videos

Until **21 January 2027**, leave this alone:

- keep the repository public;
- keep the branch named `claude/hca-publishing-kit`;
- do not move or rename anything under `marketing/videos/` or
  `marketing/hca-kit/video-pipeline/out/`.

Any of those will make the later posts publish without their video.

## The schedule

`BUFFER-SCHEDULE.csv` is the full list, pulled from Buffer: date, day, time in
Riyadh and UK, page, app, language, opening line, video file, length, shape,
the first comment, and the Buffer post id for each one.

- **Healthcare Crown Academy page:** 46 posts, 5 Nov 2026 to 28 Jan 2027.
- **Lean Six Sigma page:** 5 posts, 11 Nov to 9 Dec 2026.
- 40 English, 11 Arabic.

Times: Gulf Region Nursing posts go out at 09:00 Riyadh; the other apps at
09:00 UK (12:00 Riyadh). The fortnightly "Why Us" series uses 13:00 and 16:00
Riyadh where those slots were already taken.

## The fortnightly "Why Us" series

The Gulf "Why Us" promo runs every second Thursday from 5 Nov to 28 Jan, in
**both** languages each time (English 4:47, Arabic 6:00, both landscape). Each
airing has its own opening line and its own `?ref=` code (`whyus-li-*` and
`whyus-ar-li-*`) so the airings can be told apart in analytics, and so LinkedIn
does not treat them as duplicate posts.

**Both Why Us videos state prices on screen and in the voice-over**
($29 / month, $50 / 3 months, $69 / 6 months, 14-day refund). The post text
does not repeat them. If the subscribe page changes, these videos go stale and
should be pulled or re-rendered.

## Source copy

`../csv/` and `../data.py` hold the original per-video copy the pack was built
from. The scheduled text differs from it in one way: the app link was moved out
of the post body into the first comment.
