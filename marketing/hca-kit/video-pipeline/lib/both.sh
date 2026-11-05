#!/bin/sh
# usage: sh lib/both.sh <proj> <OutBase>   renders + encodes wide and tall in parallel, then verifies
P=$1; O=$2; rm -rf $P/frames-*
(sh lib/build.sh $P wide $O-landscape-16x9.mp4 > $P/build-wide.log 2>&1; echo DONE >> $P/build-wide.log) &
(sh lib/build.sh $P tall $O-portrait-9x16.mp4 > $P/build-tall.log 2>&1; echo DONE >> $P/build-tall.log) &
wait
for f in out/$O-*.mp4; do n=$(ffmpeg -v error -i $f -f null - 2>&1 | wc -l); d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 $f); echo "$f errors=$n dur=$d"; done
