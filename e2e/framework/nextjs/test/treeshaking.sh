#!/usr/bin/env bash

lines=$(pnpm build | grep treeshaking | sed 's/([^)]*)//g'| tr -s ' ' | sed -e 's/ \([0-9]\+\) B//g')
echo "$lines"
if [[ "$lines" != *"/treeshaking/sign-in 79.2 kB"* ]]; then
  exit 1
fi
if [[ "$lines" != *"/treeshaking/sign-out 79.5 kB"* ]]; then
  exit 1
fi
