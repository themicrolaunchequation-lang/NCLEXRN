# Serein 5.0.1 release measurements

Standalone HTML: **1,409,723 bytes** (1.40 MB), versus Phase 0 **3,642,535 bytes**; **61.3% smaller**. Gzip at level 9: 841,904 bytes (compression measurement only; server configuration varies). SHA-256: `61accafbb386359626f866bd6dd72f4bfe69db2e3d67988141eba145d25e6008`.

498 automated checks passed across catalogue/engine, behaviour/privacy, preservation/portable packaging, workers and semantic text contrasts. All 15 practices, 14 guides, eight reflection prompts, six studios, three journeys and original evidence/context content passed preservation checks.

## Asset sizes

Existing images were re-encoded as WebP quality 68, maximum width 640 px (detail images 600 px, avatar 160 px); no image was replaced. This prioritises the requested offline size budget. Large desktop/2× displays and image quality still need visual review. Each of 37 raster assets remains available. Four fonts retain Latin/Latin-1 plus used punctuation/symbols; crest fonts retain their S glyph. PNG install icons remain unchanged (16,177 / 48,004 bytes).

| Asset | Before bytes | After bytes | Reduction |
|---|---:|---:|---:|
| avatar.webp | 7,191 | 1,344 | 81.3% |
| awareness-0.webp | 60,292 | 19,306 | 68.0% |
| awareness-1.webp | 47,536 | 15,606 | 67.2% |
| awareness-2.webp | 37,222 | 11,376 | 69.4% |
| awareness-3.webp | 55,114 | 17,752 | 67.8% |
| coast.webp | 53,758 | 13,180 | 75.5% |
| detail-feet.webp | 97,585 | 9,536 | 90.2% |
| detail-hands.webp | 138,864 | 15,064 | 89.2% |
| detail-neck.webp | 77,505 | 6,740 | 91.3% |
| detail-shoulders.webp | 122,040 | 10,118 | 91.7% |
| feet-0.webp | 49,422 | 12,760 | 74.2% |
| feet-1.webp | 47,078 | 12,490 | 73.5% |
| feet-2.webp | 50,410 | 12,830 | 74.5% |
| feet-3.webp | 49,644 | 12,368 | 75.1% |
| forest.webp | 83,120 | 17,118 | 79.4% |
| hands-0.webp | 53,812 | 12,884 | 76.1% |
| hands-1.webp | 53,004 | 13,020 | 75.4% |
| hands-2.webp | 57,566 | 13,318 | 76.9% |
| hands-3.webp | 58,860 | 13,902 | 76.4% |
| leaves.webp | 78,810 | 17,894 | 77.3% |
| mountain.webp | 106,710 | 25,222 | 76.4% |
| reflection.webp | 67,112 | 16,236 | 75.8% |
| release-0.webp | 61,514 | 18,932 | 69.2% |
| release-1.webp | 60,332 | 18,342 | 69.6% |
| release-2.webp | 61,790 | 18,684 | 69.8% |
| release-3.webp | 60,174 | 18,588 | 69.1% |
| release.webp | 101,386 | 23,474 | 76.8% |
| seated.webp | 108,422 | 21,770 | 79.9% |
| shoulders-0.webp | 29,160 | 10,588 | 63.7% |
| shoulders-1.webp | 30,098 | 10,734 | 64.3% |
| shoulders-2.webp | 29,204 | 10,624 | 63.6% |
| shoulders-3.webp | 29,004 | 10,646 | 63.3% |
| team.webp | 78,480 | 19,428 | 75.2% |
| walking-0.webp | 30,448 | 10,192 | 66.5% |
| walking-1.webp | 31,086 | 10,454 | 66.4% |
| walking-2.webp | 30,904 | 10,288 | 66.7% |
| walking-3.webp | 29,364 | 9,828 | 66.5% |
| playfair-display-latin-600-normal.woff2 | 23,228 | 20,376 | 12.3% |
| playfair-display-latin-400-italic.woff2 | 21,884 | 19,176 | 12.4% |
| playfair-display-latin-400-normal.woff2 | 21,856 | 19,024 | 13.0% |
| inter-latin-wght-normal.woff2 | 48,256 | 38,376 | 20.5% |
| serein-crest.svg | 33,220 | 3,316 | 90.0% |
| serein-crest-light.svg | 33,220 | 3,316 | 90.0% |

## Measured semantic text contrast

WCAG relative luminance calculation on opaque tokens. Auto uses Light or Dark. These 39 text pairs meet 4.5:1. The 18 border/focus pairs below meet 3:1. Composited states and device rendering still need browser inspection.

| Theme | Foreground | Background | Colours | Ratio |
|---|---|---|---|---:|
| Light | text | bg | #10253A / #F8F5EF | 14.32:1 |
| Light | text | surface | #10253A / #FFFDF9 | 15.34:1 |
| Light | text | surface-raised | #10253A / #F1F6F2 | 14.25:1 |
| Light | text-muted | bg | #4C626A / #F8F5EF | 5.92:1 |
| Light | text-muted | surface | #4C626A / #FFFDF9 | 6.34:1 |
| Light | text-muted | surface-raised | #4C626A / #F1F6F2 | 5.89:1 |
| Light | accent | bg | #087D7A / #F8F5EF | 4.57:1 |
| Light | accent | surface | #087D7A / #FFFDF9 | 4.89:1 |
| Light | accent | surface-raised | #087D7A / #F1F6F2 | 4.55:1 |
| Light | danger | bg | #9C3038 / #F8F5EF | 6.67:1 |
| Light | danger | surface | #9C3038 / #FFFDF9 | 7.14:1 |
| Light | danger | surface-raised | #9C3038 / #F1F6F2 | 6.64:1 |
| Light | accent-contrast | accent | #FFFFFF / #087D7A | 4.97:1 |
| Dark | text | bg | #F8F5EF / #0B1927 | 16.32:1 |
| Dark | text | surface | #F8F5EF / #142B3D | 13.38:1 |
| Dark | text | surface-raised | #F8F5EF / #203E4B | 10.42:1 |
| Dark | text-muted | bg | #BBCFD1 / #0B1927 | 10.96:1 |
| Dark | text-muted | surface | #BBCFD1 / #142B3D | 8.98:1 |
| Dark | text-muted | surface-raised | #BBCFD1 / #203E4B | 7.00:1 |
| Dark | accent | bg | #79D4CA / #0B1927 | 10.22:1 |
| Dark | accent | surface | #79D4CA / #142B3D | 8.38:1 |
| Dark | accent | surface-raised | #79D4CA / #203E4B | 6.52:1 |
| Dark | danger | bg | #FFA5A9 / #0B1927 | 9.48:1 |
| Dark | danger | surface | #FFA5A9 / #142B3D | 7.77:1 |
| Dark | danger | surface-raised | #FFA5A9 / #203E4B | 6.05:1 |
| Dark | accent-contrast | accent | #10253A / #79D4CA | 8.97:1 |
| High contrast | text | bg | #FFF / #000 | 21.00:1 |
| High contrast | text | surface | #FFF / #080808 | 20.03:1 |
| High contrast | text | surface-raised | #FFF / #202020 | 16.29:1 |
| High contrast | text-muted | bg | #DDD / #000 | 15.46:1 |
| High contrast | text-muted | surface | #DDD / #080808 | 14.75:1 |
| High contrast | text-muted | surface-raised | #DDD / #202020 | 12.00:1 |
| High contrast | accent | bg | #8AFBE7 / #000 | 17.03:1 |
| High contrast | accent | surface | #8AFBE7 / #080808 | 16.24:1 |
| High contrast | accent | surface-raised | #8AFBE7 / #202020 | 13.22:1 |
| High contrast | danger | bg | #FFAEB5 / #000 | 11.97:1 |
| High contrast | danger | surface | #FFAEB5 / #080808 | 11.42:1 |
| High contrast | danger | surface-raised | #FFAEB5 / #202020 | 9.29:1 |
| High contrast | accent-contrast | accent | #000 / #8AFBE7 | 17.03:1 |

## Border/focus contrast

| Theme | Foreground | Background | Colours | Ratio |
|---|---|---|---|---:|
| Light | border | bg | #7B8F8A / #F8F5EF | 3.14:1 |
| Light | border | surface | #7B8F8A / #FFFDF9 | 3.37:1 |
| Light | border | surface-raised | #7B8F8A / #F1F6F2 | 3.13:1 |
| Light | focus | bg | #087D7A / #F8F5EF | 4.57:1 |
| Light | focus | surface | #087D7A / #FFFDF9 | 4.89:1 |
| Light | focus | surface-raised | #087D7A / #F1F6F2 | 4.55:1 |
| Dark | border | bg | #78969F / #0B1927 | 5.63:1 |
| Dark | border | surface | #78969F / #142B3D | 4.62:1 |
| Dark | border | surface-raised | #78969F / #203E4B | 3.60:1 |
| Dark | focus | bg | #F1C56E / #0B1927 | 10.95:1 |
| Dark | focus | surface | #F1C56E / #142B3D | 8.98:1 |
| Dark | focus | surface-raised | #F1C56E / #203E4B | 6.99:1 |
| High contrast | border | bg | #CCC / #000 | 13.08:1 |
| High contrast | border | surface | #CCC / #080808 | 12.47:1 |
| High contrast | border | surface-raised | #CCC / #202020 | 10.15:1 |
| High contrast | focus | bg | #FFD940 / #000 | 15.25:1 |
| High contrast | focus | surface | #FFD940 / #080808 | 14.54:1 |
| High contrast | focus | surface-raised | #FFD940 / #202020 | 11.83:1 |

## Performance targets — not measured

| Metric | Requested target | Verified result |
|---|---:|---|
| LCP, throttled 4G | <2.5 s | Not measured |
| CLS | <0.05 | Not measured |
| INP | <200 ms | Not measured |
| Lighthouse mobile Performance | ≥90 | Not run |
| Lighthouse Accessibility | 100 | Not run |
| Lighthouse Best Practices | ≥95 | Not run |

The environment did not provide the supported browser QA capability. No timing or Lighthouse estimates are presented as results. DOM checks cannot validate layout, native dialog behaviour, installability, screen-reader output or device API compatibility.
