#!/bin/sh
# intent-kit: Codex hook helper.
#
# Used by Codex's UserPromptSubmit / Stop hooks declared in .codex/hooks.json.
# Reads JSON on stdin from Codex, decides whether the IDD intent contract is
# satisfied for the active task. Exit codes:
#   0  — proceed
#   2  — block + write reason to stderr (Codex shows this to the user/agent)
set -eu

DOCS_DIR="${INTENT_KIT_DOCS_DIR:-docs/intent}"

# Heuristic: look for any intent.md in the docs dir. Detailed slug-routing is
# left to the agent — this hook just enforces "you must have at least one
# intent.md before substantive work".
if [ ! -d "$DOCS_DIR" ] || ! find "$DOCS_DIR" -maxdepth 2 -name 'intent.md' -print -quit | grep -q .; then
  cat <<'EOF' >&2
[intent-kit] No intent.md found under docs/intent/.

Before continuing this task, run /intent to capture the user's intent into
docs/intent/<YYYY-MM-DD-slug>/intent.md. The Intent-Driven Development workflow
requires intent → spec → plan ordering and the git hook will block out-of-order
commits.
EOF
  exit 2
fi

exit 0
