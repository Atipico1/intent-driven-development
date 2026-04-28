# intent-kit — superpowers:writing-plans override

(Shared rules from `_common.md` are also injected.)

## Pre-gate

- Both `<docsDir>/<slug>/intent.md` and `spec.md` must exist. If either is missing,
  stop and run `superpowers:brainstorming` first.
- If intent.md frontmatter has no `hash:` field, generate one and add it before
  writing the plan.

## Commit

- `[<hash>] docs(<slug>): add implementation plan`.
