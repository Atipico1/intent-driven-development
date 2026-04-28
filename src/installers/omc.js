import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir } from '../util/fs.js';

/**
 * omc (oh-my-claudecode) installer — extends Claude Code.
 *
 * omc auto-discovers skills from `.omc/skills/<name>/SKILL.md` (project) or
 * `~/.omc/skills/` (user). Frontmatter supports triggers, pipeline, handoff —
 * we use these to slot before omc's `deep-interview` skill.
 *
 * Claude Code installer should run first (settings.json hook + CLAUDE.md memory).
 * This adds:
 *  - .omc/skills/idd-capture/SKILL.md
 *  - .omc/intents/.gitkeep
 */
export async function installOmc(cwd, config, ctx, contract) {
  const files = [];
  ensureDir(path.join(cwd, '.omc/intents'));
  const gitkeep = path.join(cwd, '.omc/intents/.gitkeep');
  if (writeFileIfMissing(gitkeep, '', { force: ctx.force }).written) files.push(gitkeep);

  // Project-scoped omc skill
  const skill = path.join(cwd, '.omc/skills/idd-capture/SKILL.md');
  const body = readAsset('skills/idd-capture/SKILL.md');
  // Inject omc-flavored triggers/pipeline frontmatter on top.
  const omcBody = body.replace(
    /^---\n([\s\S]*?)\n---/,
    (_m, fm) =>
      `---\n${fm}\ntriggers: ["intent", "/intent"]\npipeline: [idd-capture, deep-interview]\nhandoff: ${config.docsDir}/{slug}/intent.md\n---`
  );
  if (writeFileIfMissing(skill, omcBody, { force: ctx.force }).written) files.push(skill);

  return {
    files,
    notes: ['omc skill registered with triggers + pipeline (chains into deep-interview)'],
  };
}
