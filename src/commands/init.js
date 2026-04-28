import { resolveConfig, isHeadless } from '../config.js';
import { detectHarnesses, HARNESS_LABELS } from '../detect.js';
import { buildContract } from '../concept.js';
import { installUniversalGitHooks } from '../installers/universal-git-hooks.js';
import { installTemplates } from '../installers/templates.js';
import { INSTALLERS, INSTALL_ORDER, ALL_HARNESSES } from '../installers/index.js';
import { confirm, pickMany, ask } from '../prompts.js';
import { log } from '../util/log.js';

export async function runInit(opts) {
  const cwd = process.cwd();
  const config = resolveConfig(opts);
  const headless = isHeadless(opts);
  const ctx = { force: !!opts.force, dryRun: !!opts.dryRun };

  log.step('Intent-Driven Development setup');

  // 1) Determine target harnesses.
  let targets;
  if (opts.target?.length) {
    targets = opts.target.includes('all') ? [...ALL_HARNESSES] : opts.target;
  } else {
    const detected = detectHarnesses(cwd);
    if (detected.length === 0) {
      log.info('No AI coding harness detected. Falling back to plain (AGENTS.md only).');
      targets = ['plain'];
    } else {
      log.info(`Detected: ${detected.map((h) => HARNESS_LABELS[h]).join(', ')}`);
      if (headless) {
        targets = detected;
      } else {
        const picks = await pickMany(
          'Install IDD for which harness(es)?',
          detected.map((h) => ({ value: h, label: HARNESS_LABELS[h] })),
          detected
        );
        targets = picks.length ? picks : detected;
      }
    }
  }

  // 2) Confirm config (interactive only).
  if (!headless) {
    const docsDir = await ask('Where should intent docs live?', config.docsDir);
    if (docsDir) config.docsDir = docsDir;
    const goAhead = await confirm(
      `Install IDD into ${targets.map((t) => HARNESS_LABELS[t] || t).join(', ')} with docs at "${config.docsDir}"?`,
      true
    );
    if (!goAhead) {
      log.warn('Aborted by user.');
      return;
    }
  }

  const contract = buildContract(config);

  // 3) Universal layer — git hooks + templates (always).
  log.step('Universal git layer');
  if (config.installGitHooks !== false) {
    const r = await installUniversalGitHooks(cwd, config, ctx);
    r.files.forEach((f) => log.ok(f));
    r.notes.forEach((n) => log.dim(n));
  } else {
    log.warn('Skipping git hooks (--no-git-hooks)');
  }
  const t = installTemplates(cwd, config, ctx);
  t.files.forEach((f) => log.ok(f));

  // 4) Per-harness installers, in dependency order.
  for (const h of INSTALL_ORDER) {
    if (!targets.includes(h)) continue;
    const fn = INSTALLERS[h];
    if (!fn) continue;
    log.step(HARNESS_LABELS[h] || h);
    try {
      const r = await fn(cwd, config, ctx, contract);
      r.files.forEach((f) => log.ok(f));
      r.notes?.forEach((n) => log.dim(n));
    } catch (err) {
      log.err(`${h} installer failed: ${err.message}`);
      if (process.env.INTENT_KIT_DEBUG) console.error(err.stack);
    }
  }

  log.step('Done');
  log.info('Next:');
  log.dim(`  git add ${config.docsDir}/_templates .githooks .claude .codex .opencode AGENTS.md CLAUDE.md package.json 2>/dev/null || true`);
  log.dim('  Then commit so teammates pick up the workflow on `npm install`.');
  log.dim('  Run `intent-kit doctor` any time to verify the install.');
}
