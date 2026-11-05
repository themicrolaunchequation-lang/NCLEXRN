#!/bin/sh
# usage: sh lib/prep.sh <proj>  -> voices, timeline, music, data.js
set -e
./kenv/bin/python vo.py $1 | tail -1
python3 lib/timeline.py $1
./kenv/bin/python lib/music.py $1
python3 lib/data.py $1
