---
description: Write plan.md for the current IDD slug
---

The user wants you to draft `plan.md` for the active slug under `<docsDir>/<slug>/`.

1. Verify `intent.md` AND `spec.md` exist for this slug. If either is missing, stop.
2. Read both, plus the plan template at `<docsDir>/_templates/plan.md`.
3. Draft the plan: overview, ordered steps, verification, rollback, risks.
4. Show it to the user. Get approval.
5. Save to `<docsDir>/<slug>/plan.md`.

Commit using subject prefix `[<intent-hash>] docs(<slug>): add plan`.
