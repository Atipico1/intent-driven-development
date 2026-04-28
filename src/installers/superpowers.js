import path from 'node:path';
import { readAsset, writeFileIfMissing, ensureDir, chmodExec } from '../util/fs.js';
import { mergeJsonFile } from '../util/json.js';

/**
 * superpowers (obra/superpowers Claude Code plugin) installer.
 *
 * superpowers ships brainstorming/writing-plans/executing-plans/subagent-driven-development
 * skills but does NOT use a PreToolUse:Skill hook itself (verified vs v5.0.7).
 * That slot is uncontested — we register a matcher on Skill that fires on
 * `superpowers:*` and injects override text into the skill's context.
 *
 * Claude Code installer should run first. This installer adds:
 *  - .claude/intent-kit/overrides/{_common,brainstorming,writing-plans,executing-plans,subagent-driven-development}.md
 *  - The hook script + settings.json registration are reused from claude-code installer.
 */
export async function installSuperpowers(cwd, config, ctx, contract) {
  const files = [];
  const baseDir = path.join(cwd, '.claude/intent-kit/overrides');
  ensureDir(baseDir);

  for (const name of ['_common', 'brainstorming', 'writing-plans', 'executing-plans', 'subagent-driven-development']) {
    const target = path.join(baseDir, `${name}.md`);
    const src = readAsset(`superpowers-overrides/${name}.md`);
    // Substitute <docsDir> placeholder so users see the configured path.
    const filled = src.replaceAll('<docsDir>', config.docsDir);
    if (writeFileIfMissing(target, filled, { force: ctx.force }).written) files.push(target);
  }

  // Ensure the PreToolUse:Skill hook script exists (claude-code installer
  // already wrote it, but be defensive in case superpowers is installed alone).
  const hookScript = path.join(cwd, '.claude/hooks/intent-kit-skill-override.sh');
  ensureDir(path.dirname(hookScript));
  const r = writeFileIfMissing(hookScript, readAsset('claude-code/hooks/intent-kit-skill-override.sh'), { force: ctx.force });
  if (r.written) {
    chmodExec(hookScript);
    files.push(hookScript);
  }

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

  return {
    files,
    notes: [
      'PreToolUse:Skill matcher injects intent-kit overrides into superpowers:brainstorming, writing-plans, executing-plans, subagent-driven-development',
    ],
  };
}
