#!/usr/bin/env bash
expected=$(cat << EOF
auth createUserAndSignInWithEmailAndPassword 79.1 kB
auth onAuthStateChanged 79.2 kB
auth signInWithGoogleRedirect 79.5 kB
auth signOut 79.2 kB
db getDoc 80.4 kB
db setDoc 80.3 kB
storage getDownloadUrl 80.3 kB
storage uploadDataUrl 80.3 kB
EOF
)

actual=$(pnpm build \
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
