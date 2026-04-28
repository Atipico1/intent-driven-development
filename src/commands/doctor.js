import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { detectHarnesses, HARNESS_LABELS } from '../detect.js';
import { resolveConfig } from '../config.js';
import { log } from '../util/log.js';

export async function runDoctor() {
  const cwd = process.cwd();
  const config = resolveConfig({});
  let problems = 0;

  log.step('Intent-Driven Development health check');

  // Universal layer
  for (const f of ['.githooks/prepare-commit-msg', '.githooks/pre-commit']) {
    const p = path.join(cwd, f);
    if (fs.existsSync(p)) log.ok(f);
    else {
      log.err(`${f} missing — run \`intent-kit init\` again.`);
      problems++;
    }
  }
  try {
    const v = execSync('git config core.hooksPath', { cwd, encoding: 'utf8' }).trim();
    if (v === '.githooks') log.ok('git core.hooksPath = .githooks');
    else {
      log.err(`git core.hooksPath = "${v}" (expected ".githooks")`);
      problems++;
    }
  } catch {
    log.err('git core.hooksPath not configured');
    problems++;
  }

  // Templates
  for (const a of config.artifacts) {
    const p = path.join(cwd, config.docsDir, '_templates', `${a}.md`);
    if (fs.existsSync(p)) log.ok(p);
    else {
      log.warn(`${p} missing (template absent)`);
    }
  }

  // Harness signals
  const detected = detectHarnesses(cwd);
  if (detected.length === 0) log.warn('No harness detected (plain mode)');
  else log.info(`Active harnesses: ${detected.map((d) => HARNESS_LABELS[d]).join(', ')}`);

  if (problems === 0) log.ok('All checks passed.');
  else {
    log.err(`${problems} problem(s) found.`);
    process.exitCode = 1;
  }
}
