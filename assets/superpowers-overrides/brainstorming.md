# intent-kit — superpowers:brainstorming override

(Shared rules from `_common.md` are also injected.)

## Entry procedure

1. Run the existing brainstorming steps 1–3 (context gathering, visual aids, clarifying questions).
2. **Section 3.5 (intent capture)**: walk session history and draft the five intent.md sections —
   Original request / Background context / What they actually want / Why now / Intent evolution.
   Have the user review and approve. Generate the 5-character hash via
   `printf '%s' "$slug" | shasum | cut -c1-5`, record it in frontmatter `hash:`, save to
   `<docsDir>/<slug>/intent.md`.
3. Run the existing steps 4–7 — save the spec to `<docsDir>/<slug>/spec.md`.
4. Commit: `[<hash>] docs(<slug>): add intent and spec`.
