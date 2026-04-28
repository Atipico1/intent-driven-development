# intent-kit — superpowers shared override

This project uses Intent-Driven Development. Every superpowers brainstorming /
planning skill runs inside that workflow.

## Output paths

- Intent: `<docsDir>/<slug>/intent.md`
- Spec:   `<docsDir>/<slug>/spec.md`  (instead of superpowers' default `specs/<slug>-design.md`)
- Plan:   `<docsDir>/<slug>/plan.md`  (instead of superpowers' default `plans/<slug>.md`)
- `<slug>` format: `YYYY-MM-DD-<kebab-topic>`
- Templates live at `<docsDir>/_templates/`.

## Intent immutability

- Intent files declare `status: frozen` in frontmatter.
- After the first commit, do not rewrite the original-request / background-context /
  what-they-actually-want / why-now sections.
- Scope changes are appended at the bottom under `## Scope change [YYYY-MM-DD]`
  (or extend the existing `## Intent evolution` section).

## Commit prefix → trailer

- Slug-related commits prefix the subject line with `[<5-char-hash>] `.
- Hash source: the `hash:` frontmatter field of the active slug's intent.md.
  If missing, generate via `printf '%s' "$slug" | shasum | cut -c1-5` and
  write it into intent.md before committing.
- The prepare-commit-msg hook parses the prefix, looks up the slug, appends
  `Intent: / Spec: / Plan:` trailers, and **always strips the prefix**.
- Commits without a prefix are no-ops for the hook (hotfixes, unrelated work).
- Per-slug commit lookup: `git log --grep "Intent: <docsDir>/<slug>/"`.
