# intent-kit — superpowers:executing-plans override

(Shared rules from `_common.md` are also injected.)

## Subagent runtime

- Subagents do not commit mid-flight. The main session commits everything in
  one batch after the user approves the completed work.
- Every commit related to this slug must use the `[<hash>]` prefix described
  in `_common.md` so the git hook can attach Intent/Spec/Plan trailers.
- Per-slug retrieval: `git log --grep "Intent: <docsDir>/<slug>/"`.
