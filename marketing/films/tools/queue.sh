#!/bin/bash
# Renders silent video for the given films in both shapes, 3 at a time. Usage: tools/queue.sh medlex-50 carecraft-180 ...
cd "$(dirname "$0")/.."
jobs_list=()
for f in "$@"; do for ar in 16x9 9x16; do [ -f render/$f-$ar.mp4 ] || jobs_list+=("$f $ar"); done; done
printf '%s\n' "${jobs_list[@]}" | xargs -P 3 -L 1 bash -c 'node tools/frames.js $0 $1 render/$0-$1.part.mp4 before && mv render/$0-$1.part.mp4 render/$0-$1.mp4'
