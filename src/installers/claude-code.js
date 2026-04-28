import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir, chmodExec } from '../util/fs.js';
import { upsertRulesBlock } from '../util/markdown.js';
import { mergeJsonFile } from '../util/json.js';

/**
 * Claude Code installer.
 *
 * Installs:
 *  - .claude/skills/idd-capture/SKILL.md  (canonical capture procedure)
 *  - .claude/commands/{intent,spec,plan}.md (slash commands)
 *  - .claude/hooks/intent-kit-skill-override.sh (PreToolUse:Skill hook — only
 *    fires for the matchers we declare; safe to coexist with other plugins)
 *  - .claude/intent-kit/overrides/  (placeholder; superpowers installer fills these)
 *  - Updates .claude/settings.json to register the PreToolUse:Skill hook
 *  - Appends IDD rules to CLAUDE.md
 */
export async function installClaudeCode(cwd, config, ctx, contract) {
  const files = [];

  // Skill body
  const skillPath = path.join(cwd, '.claude/skills/idd-capture/SKILL.md');
  if (writeFileIfMissing(skillPath, readAsset('skills/idd-capture/SKILL.md'), { force: ctx.force }).written)
    files.push(skillPath);

  // Slash commands
  for (const name of ['intent', 'spec', 'plan']) {
    const p = path.join(cwd, `.claude/commands/${name}.md`);
    if (writeFileIfMissing(p, readAsset(`claude-code/commands/${name}.md`), { force: ctx.force }).written)
      files.push(p);
  }

  // PreToolUse:Skill hook script
  const hookScript = path.join(cwd, '.claude/hooks/intent-kit-skill-override.sh');
  if (writeFileIfMissing(hookScript, readAsset('claude-code/hooks/intent-kit-skill-override.sh'), { force: ctx.force }).written) {
    chmodExec(hookScript);
    files.push(hookScript);
  }

  // Empty overrides dir so the hook script's `[ -d "$base" ] || exit 0` finds it.
  ensureDir(path.join(cwd, '.claude/intent-kit/overrides'));

  // Register hook in .claude/settings.json (deep-merged; other hooks preserved).
  if (!ctx.dryRun) {
    mergeJsonFile(path.join(cwd, '.claude/settings.json'), {
      hooks: {
        PreToolUse: [
          {
            matcher: 'Skill',
            hooks: [
              {
                type: 'command',
                command: '$CLAUDE_PROJECT_DIR/.claude/hooks/intent-kit-skill-override.sh',
              },
            ],
          },
        ],
      },
    });
  }
  files.push(path.join(cwd, '.claude/settings.json'));

  // Memory file
  const claudeMd = path.join(cwd, 'CLAUDE.md');
  upsertRulesBlock(claudeMd, contract.rulesMarkdown);
  files.push(claudeMd);

  return {
    files,
    notes: [
      'Slash commands: /intent, /spec, /plan',
      'PreToolUse:Skill hook registered in .claude/settings.json',
      'CLAUDE.md memory updated with IDD rules',
    ],
  };
}
