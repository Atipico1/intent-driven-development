import fs from 'node:fs';
import { Command, Option } from 'commander';
import { runInit } from './commands/init.js';
import { runDoctor } from './commands/doctor.js';
import { runSync } from './commands/sync.js';

export async function run(argv) {
  const program = new Command();
  program
    .name('intent-kit')
    .description(
      'Intent-Driven Development for AI coding agents. Captures intent → spec → plan as git artifacts, enforced by git hooks, integrated with Claude Code, Codex, OpenCode, omo, omc, omx, and superpowers.'
    )
    .version(readVersion());

  program
    .command('init')
    .description('Detect AI coding harnesses and install IDD workflow.')
    .addOption(
      new Option('-t, --target <harnesses...>', 'Force install for specific harnesses (skip auto-detect). Use "all" for every supported harness.')
    )
    .addOption(new Option('--docs-dir <path>', 'Where intent/spec/plan docs live').default('docs/intent'))
    .addOption(new Option('--hash-length <n>', 'Length of commit-prefix hash').default('5'))
    .addOption(new Option('--trailer-prefix <name>', 'Trailer field prefix (e.g. "Intent")').default('Intent'))
    .addOption(new Option('--no-git-hooks', 'Skip installing git hooks (universal layer)'))
    .addOption(new Option('--yes', 'Accept all defaults; no prompts (headless mode)'))
    .addOption(new Option('--headless', 'Synonym for --yes; intended for agent-driven runs'))
    .addOption(new Option('--dry-run', "Show what would be installed; don't write files"))
    .addOption(new Option('--config <path>', 'Load config from JSON or YAML file'))
    .addOption(new Option('--force', 'Overwrite existing files (default: skip)'))
    .action(async (opts) => {
      await runInit(opts);
    });

  program
    .command('doctor')
    .description('Verify the IDD install is wired up correctly.')
    .action(async () => {
      await runDoctor();
    });

  program
    .command('sync')
    .description('Re-apply the git config (used by package.json `prepare` script after npm install).')
    .action(async () => {
      await runSync();
    });

  await program.parseAsync(argv);
}

function readVersion() {
  try {
    const url = new URL('../package.json', import.meta.url);
    const json = JSON.parse(fs.readFileSync(url, 'utf8'));
    return json.version;
  } catch {
    return '0.0.0';
  }
}
