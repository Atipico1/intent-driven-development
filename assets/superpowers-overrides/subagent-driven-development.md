# intent-kit — superpowers:subagent-driven-development override

(Shared rules from `_common.md` are also injected.)

Same rules as executing-plans:

- Subagents do not commit mid-flight. Main session batches commits at the end,
  after user approval.
- All commits use the `[<hash>]` prefix so trailers are auto-injected.
