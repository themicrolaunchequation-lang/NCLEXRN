#!/bin/bash
# Waits for the first queue, renders the remaining films, then all finals (voice only until music arrives).
cd "$(dirname "$0")/.."
while pgrep -f "tools/queue.sh medlex-50" >/dev/null; do sleep 30; done
tools/queue.sh medlex-180 lss-180
for f in medlex-50 carecraft-50 lumen-50 serein-50 gulf-50 lss-50 evinca-50 medlex-180 carecraft-180 lumen-180 serein-180 gulf-180 lss-180 evinca-180; do
  app=${f%-*}; L=${f#*-}
  for ar in 16x9 9x16; do
    python3 tools/final.py $app $L $ar before
    case $app in medlex|carecraft|lumen|lss) python3 tools/final.py $app $L $ar after;; esac
  done
done
echo ALL DONE
