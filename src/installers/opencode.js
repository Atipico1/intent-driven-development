import path from 'node:path';
import fs from 'node:fs';
import { readAsset, writeFileIfMissing, ensureDir } from '../util/fs.js';
import { upsertRulesBlock } from '../util/markdown.js';
import { mergeJsonFile } from '../util/json.js';

/**
 * OpenCode (sst/opencode) installer.
 *
 * OpenCode auto-discovers skills from .opencode/skills, .claude/skills,
 * .agents/skills (and global equivalents). It also supports an `instructions`
 * glob in opencode.json that injects markdown into every session prompt.
 *
 * Installs:
 *  - .opencode/skills/idd-capture/SKILL.md (canonical skill body)
 *  - .opencode/commands/{intent,spec,plan}.md (slash commands)
 *  - .opencode/opencode.json (instructions glob → AGENTS.md so the rules block flows)
 *  - Appends IDD rules to AGENTS.md
 */
export async function installOpenCode(cwd, config, ctx, contract) {
  const files = [];

  // Skill body
  const skillPath = path.join(cwd, '.opencode/skills/idd-capture/SKILL.md');
  if (writeFileIfMissing(skillPath, readAsset('skills/idd-capture/SKILL.md'), { force: ctx.force }).written)
    files.push(skillPath);

  // Slash commands (OpenCode `commands/` markdown)
  for (const name of ['intent', 'spec', 'plan']) {
    const p = path.join(cwd, `.opencode/commands/${name}.md`);
    // The Claude Code commands work as-is for OpenCode (same markdown shape).
    if (writeFileIfMissing(p, readAsset(`claude-code/commands/${name}.md`), { force: ctx.force }).written)
      files.push(p);
  }

  // opencode.json — merge instructions glob so the rules in AGENTS.md flow into every session.
  if (!ctx.dryRun) {
    mergeJsonFile(path.join(cwd, 'opencode.json'), {
      $schema: 'https://opencode.ai/config.json',
      instructions: ['AGENTS.md'],
    });
  }
  files.push(path.join(cwd, 'opencode.json'));

  // AGENTS.md memory
  const agentsMd = path.join(cwd, 'AGENTS.md');
  upsertRulesBlock(agentsMd, contract.rulesMarkdown);
  files.push(agentsMd);

  return {
    files,
    notes: [
      'opencode.json: instructions glob includes AGENTS.md',
      'Slash commands: /intent, /spec, /plan',
    ],
  };
}
