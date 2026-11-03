#!/bin/bash
cd "$(dirname "$0")"
a=$1; f=$2; extra=""; [ "$a" = "snle" ] && extra="--disclaimer"
python3 assemble.py $a $f $extra > work/reasm-$a-$f.log 2>&1 && echo "done $a $f" >> work/reasm.log
