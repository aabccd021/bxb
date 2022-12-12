#!/usr/bin/env bash
expected=$(cat << EOF
auth createUserAndSignInWithEmailAndPassword 80.4 kB
auth onAuthStateChanged 79.2 kB
auth signInWithGoogleRedirect 80.5 kB
auth signOut 80.8 kB
db getDoc 80.4 kB
db upsertDoc 80.3 kB
storage getDownloadUrl 80.4 kB
storage uploadDataUrl 80.4 kB
EOF
)

raw=$(pnpm build)
actual=$(echo "$raw" \
  | grep treeshaking \
  | sed 's/treeshaking//g' \
  | sed 's/\// /g' \
  | sed -e 's/ \([0-9]\+\) B//g'\
  | sed "s/[^[:alnum:][:blank:].-]//g" \
  | tr -s ' ' \
  | awk '{$1=$1};1' \
)
echo "$actual"
[[ "$actual" == "${expected}" ]] || exit 1
