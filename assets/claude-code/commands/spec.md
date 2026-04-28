---
description: Write spec.md for the current IDD slug
---

The user wants you to draft `spec.md` for the active slug under `<docsDir>/<slug>/`.

1. Verify `intent.md` exists for this slug. If not, stop and tell the user to run `/intent` first.
2. Read `intent.md` and the spec template at `<docsDir>/_templates/spec.md`.
3. Draft the spec: goal, non-goals, constraints, design, alternatives considered, open questions.
4. Show it to the user. Get approval.
5. Save to `<docsDir>/<slug>/spec.md`.

Commit using subject prefix `[<intent-hash>] docs(<slug>): add spec`.
