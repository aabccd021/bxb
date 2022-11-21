#!/usr/bin/env bash

lines=$(pnpm build | grep treeshaking | sed 's/([^)]*)//g' | tr -s ' ')
echo "$lines"
if [[ "$lines" != *"/treeshaking/sign-in 470 B 79.2 kB"* ]]; then
  exit 1
fi
if [[ "$lines" != *"/treeshaking/sign-out 425 B 79.5 kB"* ]]; then
  exit 1
fi
