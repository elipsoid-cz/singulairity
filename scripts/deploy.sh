#!/bin/sh
# Publish the current HEAD to GitHub Pages as a clean snapshot on the remote's main branch.
# Private working files (docs/, .claude/) and the local history never leave this machine:
# each deploy is one commit on the local "public" branch, built from HEAD's tree minus those paths.
set -eu
cd "$(git rev-parse --show-toplevel)"

EXCLUDE="docs .claude"
REMOTE=origin
AUTHOR_NAME="elipsoid-cz"
AUTHOR_EMAIL="117190824+elipsoid-cz@users.noreply.github.com"

if [ -n "$(git status --porcelain)" ]; then echo "Commit your changes first." >&2; exit 1; fi

INDEX=$(mktemp)
trap 'rm -f "$INDEX"' EXIT
GIT_INDEX_FILE="$INDEX" git read-tree HEAD
for p in $EXCLUDE; do GIT_INDEX_FILE="$INDEX" git rm -r -q --cached --ignore-unmatch "$p"; done
TREE=$(GIT_INDEX_FILE="$INDEX" git write-tree)

PARENT=$(git rev-parse -q --verify refs/heads/public || true)
if [ -n "$PARENT" ] && [ "$(git rev-parse "$PARENT^{tree}")" = "$TREE" ]; then echo "Nothing new to publish."; exit 0; fi

MSG="Singulairity $(date -u +%Y-%m-%d) ($(git rev-parse --short HEAD))"
COMMIT=$(GIT_AUTHOR_NAME="$AUTHOR_NAME" GIT_AUTHOR_EMAIL="$AUTHOR_EMAIL" \
  GIT_COMMITTER_NAME="$AUTHOR_NAME" GIT_COMMITTER_EMAIL="$AUTHOR_EMAIL" \
  git commit-tree "$TREE" ${PARENT:+-p "$PARENT"} -m "$MSG")
git update-ref refs/heads/public "$COMMIT"
git push "$REMOTE" public:main
echo "Published $COMMIT"
