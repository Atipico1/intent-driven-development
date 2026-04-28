---
name: idd-capture
description: Captures user intent into a frozen intent.md before any spec, plan, or code work. Required first step in Intent-Driven Development.
---

# IDD: capture intent

This skill is the first step of the Intent-Driven Development workflow installed
by [intent-kit](https://github.com/Atipico1/intent-driven-development). It
captures *why* the user wants the work done, not *what* the work is.

## When to use

Whenever a user asks for non-trivial work — a feature, refactor, bug fix, or
investigation — and there is no `intent.md` for the current slug yet.

If `intent.md` already exists for the active slug, skip this skill and proceed
to the spec / plan stage instead.

## Procedure

1. Pick a slug: `YYYY-MM-DD-<kebab-topic>`.
2. Generate the commit-prefix hash:
   `printf '%s' "$slug" | shasum | cut -c1-5`
3. Walk the conversation and draft these five sections:
   - **Original request** — quote the user's actual prompt.
   - **Background context** — earlier work, constraints, related plans.
   - **What they actually want** — the real need behind the surface ask.
   - **Why now** — the trigger; why not earlier.
   - **Intent evolution** — how the intent shifted while you discussed.
4. Show the draft to the user. Get explicit approval.
5. Write to `<docsDir>/<slug>/intent.md` using the template at
   `<docsDir>/_templates/intent.md`. Set frontmatter `status: frozen` and
   include the `hash:` field.
6. After this skill completes, only proceed to spec / plan if the user has
   confirmed the intent.

## Rules

- **Append-only**: never rewrite the original-request / background-context /
  what-they-actually-want / why-now sections after the first commit. Append
  scope changes under `## Scope change [YYYY-MM-DD]` or `## Intent evolution`.
- **One slug per task**: do not reuse a slug for unrelated work.
- **Hash collision**: if `printf '%s' "$slug" | shasum | cut -c1-5` matches
  another slug's hash, change the slug name slightly. Do not extend the hash
  length.

## Commit format

When committing the intent.md (and any work tied to this slug), prefix the
subject line with `[<5-char-hash>] `. Example:
`[265fa] docs(my-feature): capture intent`. The prepare-commit-msg git hook
strips the prefix and injects `Intent: <path>` (and Spec/Plan if those exist)
as trailers. So `git log --grep "Intent: <docsDir>/<slug>/"` reconstructs the
full chain later.
