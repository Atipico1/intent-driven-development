/**
 * The IDD concept — a framework-agnostic contract every harness installer
 * must translate into the harness's native idiom.
 *
 * Functional invariants (all harnesses must enforce these):
 *  1. Before non-trivial work, agent captures intent into <docsDir>/<slug>/intent.md.
 *  2. Spec and plan files require their predecessor to exist (intent → spec → plan).
 *  3. Commits authored by the agent carry a hash prefix on the subject line so
 *     the universal git hook can map them back to <docsDir>/<slug>/intent.md
 *     via the `hash:` frontmatter field, and inject Intent/Spec/Plan trailers.
 *
 * Each installer implements these invariants using the harness's own
 * extension points: hooks, skills, agent prompts, slash commands, etc.
 */

export const CONCEPT_VERSION = '0.1';

export function buildContract(config) {
  return {
    version: CONCEPT_VERSION,
    docsDir: config.docsDir,
    artifacts: config.artifacts,
    dependencies: config.dependencies,
    hashLength: config.hashLength,
    trailerPrefix: config.trailerPrefix,
    /**
     * Human-readable rules block injected into agent memory files
     * (CLAUDE.md, AGENTS.md, OpenCode instructions, etc.).
     * Identical wording across harnesses to keep one source of truth.
     */
    rulesMarkdown: rulesText(config),
    skillFrontmatter: {
      name: 'idd-capture',
      description:
        'Captures user intent into intent.md before any spec/plan/code work. Required by Intent-Driven Development workflow.',
    },
  };
}

function rulesText(c) {
  return `<!-- intent-kit:rules-begin -->

## Intent-Driven Development (IDD) workflow

This project uses [intent-kit](https://github.com/Atipico1/intent-driven-development).
Before writing code or specs, capture user intent. The git hooks installed by
intent-kit will block out-of-order commits.

**Directory layout** (under \`${c.docsDir}/<YYYY-MM-DD-slug>/\`):

- \`intent.md\` — original request, background, what they actually want, why now (frozen, append-only)
- \`spec.md\` — design document (requires intent.md)
- \`plan.md\` — step-by-step plan (requires intent.md + spec.md)

**For agents — when to use which skill / command**:

- Starting fresh work → write \`intent.md\` first (use \`/intent\` if available)
- After intent is approved → write \`spec.md\` (\`/spec\`)
- After spec is approved → write \`plan.md\` (\`/plan\`)
- Templates live at \`${c.docsDir}/_templates/\`.

**Commit subject prefix** — every commit related to a slug must start with
\`[<${c.hashLength}-char-hex>] \`. The hex matches the \`hash:\` frontmatter field
in that slug's intent.md. The prepare-commit-msg git hook will:

1. Look up the slug by hash.
2. Strip the prefix from the subject line (so it never lands in git history).
3. Append trailers — each independently, only if the corresponding file exists:
   - \`${c.trailerPrefix}: <path-to-intent.md>\` (always, once intent.md exists)
   - \`Spec: <path-to-spec.md>\` (only if spec.md exists)
   - \`Plan: <path-to-plan.md>\` (only if plan.md exists)

This means the very first commit on a slug — when only intent.md exists — still
gets the Intent trailer. Spec/Plan trailers join later as those artifacts land.

So \`git log --grep "${c.trailerPrefix}: ${c.docsDir}/<slug>/"\` reconstructs
the full origin → spec → plan → implementation chain for any feature.

**Hash generation**:
\`\`\`sh
slug="YYYY-MM-DD-my-feature"
printf '%s' "$slug" | shasum | cut -c1-${c.hashLength}
\`\`\`
Write this value to the \`hash:\` frontmatter of intent.md.

<!-- intent-kit:rules-end -->`;
}
