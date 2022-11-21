#!/usr/bin/env bash

lines=$(pnpm build | grep treeshaking | tr -s ' ' | sed 's/([^)]*)//g')
echo "$lines"
if [[ "$lines" != *"/treeshaking/sign-in 480 B 79.9 kB"* ]]; then
  exit 1
fi
if [[ "$lines" != *"/treeshaking/sign-out 468 B 79.9 kB"* ]]; then
  exit 1
fi
