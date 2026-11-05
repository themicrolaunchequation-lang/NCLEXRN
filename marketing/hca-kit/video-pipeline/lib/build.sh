#!/bin/sh
# usage: sh lib/build.sh <proj> <fmt> <outname>
set -e
P=$1; F=$2; O=$3
node lib/render.mjs $P $F
./kenv/bin/python lib/mix.py $P $F
ffmpeg -v error -y -i $P/mix-$F.wav -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=summary -ar 48000 $P/mixn-$F.wav 2> $P/loud-$F.txt
mkdir -p out
ffmpeg -v error -y -framerate 30 -i $P/frames-$F/%05d.jpg -i $P/mixn-$F.wav -c:v libx264 -preset slow -crf 19 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -shortest -movflags +faststart out/$O
echo built out/$O
