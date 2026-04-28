import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir } from '../util/fs.js';

/**
 * omx (oh-my-codex) installer — extends Codex.
 *
 * omx already runs `omx setup` to write .codex/hooks.json + .omx/ runtime.
 * We slot intent capture before its `ralplan` skill via skill frontmatter
 * `next-skill: ralplan` + `handoff: <docsDir>/<slug>/intent.md`.
 *
 * Codex installer must run first (it handles git-side enforcement and AGENTS.md).
 * This installer adds:
 *  - .omx/intents/.gitkeep (so the intent docs directory is git-tracked)
 *  - .codex/skills/idd-capture/SKILL.md with omx-flavored frontmatter
 */
export async function installOmx(cwd, config, ctx, contract) {
  const files = [];
  ensureDir(path.join(cwd, '.omx/intents'));
  const gitkeep = path.join(cwd, '.omx/intents/.gitkeep');
  if (writeFileIfMissing(gitkeep, '', { force: ctx.force }).written) files.push(gitkeep);

  // omx-flavored skill (chains into ralplan)
  const omxSkill = path.join(cwd, '.codex/skills/idd-capture/SKILL.md');
  if (writeFileIfMissing(omxSkill, readAsset('codex/skills/idd-capture/SKILL.md'), { force: ctx.force }).written)
    files.push(omxSkill);

  return {
    files,
    notes: [
      "Skill chains into omx's `ralplan` via next-skill frontmatter",
      '.omx/intents/ created for slug docs',
    ],
  };
}
