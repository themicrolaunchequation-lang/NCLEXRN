#!/usr/bin/env python3
"""Find the section bands of the Carecraft infographic PNGs (hero, numbered blocks, footer) and write them as
fractional rects for the Learning Studio spotlight tour. The posters come from one template, so bands are detected
from the dark hero card, the accent bar on the left of each block and the dark footer card.
usage: poster-regions.py <infographics dir> <out.json>"""
import sys, json, os
from PIL import Image

def runs(flags, min_len=1, gap=0):
    out, start, last = [], None, None
    for y, f in enumerate(flags):
        if f:
            if start is None: start = y
            last = y
        elif start is not None and y - last > gap:
            if last - start + 1 >= min_len: out.append((start, last))
            start = None
    if start is not None and last - start + 1 >= min_len: out.append((start, last))
    return out

def navy(c): return c[0] < 40 and c[1] < 62 and c[2] < 95
def paper(c): return abs(c[0] - 250) < 7 and abs(c[1] - 248) < 7 and abs(c[2] - 243) < 9

def analyze(path):
    im = Image.open(path).convert('RGB'); W, H = im.size
    px = im.load(); top = int(H * .1)
    nv = runs([navy(px[940, y]) for y in range(H)], 40, 14)                  # hero + footer cards (right margin: no text)
    bars = runs([not paper(px[50, y]) for y in range(top, H)], 20, 10)       # block cards (left edge is never paper)
    bars = [(a + top, b + top) for a, b in bars]
    hero, foot = nv[0], nv[-1]
    blocks = [r for r in bars if r[0] > hero[1] and r[1] < foot[0]]
    return W, H, hero, blocks, foot

def frac(W, H, x0, y0, x1, y1, pad=14):
    y0 = max(0, y0 - pad); y1 = min(H, y1 + pad)
    return [0, round(y0 / H, 4), 1, round((y1 - y0) / H, 4)]

def main(src, dst):
    out = {}
    for f in sorted(os.listdir(src)):
        if not f.endswith('.png'): continue
        id_, page = f[:-4].rsplit('-', 1)
        W, H, hero, blocks, foot = analyze(os.path.join(src, f))
        regs = {
            'size': [W, H],
            'header': [0, 0, 1, round((hero[0] - 6) / H, 4)],
            'hero': frac(W, H, 0, hero[0], W, hero[1], 6),
            'blocks': [frac(W, H, 0, a - 18, W, b + 18, 6) for a, b in blocks],
            'footer': frac(W, H, 0, foot[0], W, foot[1], 10)
        }
        out.setdefault(id_, {})[page] = regs
    json.dump(out, open(dst, 'w'), separators=(',', ':'))
    bad = [(i, p, len(r['blocks'])) for i, d in out.items() for p, r in d.items() if len(r['blocks']) != (4 if p == '3' else 3)]
    print('lessons', len(out), 'pages', sum(len(d) for d in out.values()), 'odd block counts', bad)

if __name__ == '__main__': main(sys.argv[1], sys.argv[2])
