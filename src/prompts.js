import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

/**
 * Minimal interactive prompts — stdlib only, no external deps.
 * Fall back to defaults when stdin is not a TTY.
 */
export async function confirm(question, defaultYes = true) {
  if (!input.isTTY) return defaultYes;
  const rl = readline.createInterface({ input, output });
  try {
    const suffix = defaultYes ? ' [Y/n] ' : ' [y/N] ';
    const ans = (await rl.question(question + suffix)).trim().toLowerCase();
    if (ans === '') return defaultYes;
    return ans.startsWith('y');
  } finally {
    rl.close();
  }
}

export async function pickMany(question, options, preselected = []) {
  if (!input.isTTY) return preselected.length ? preselected : options.map((o) => o.value);
  const rl = readline.createInterface({ input, output });
  try {
    output.write(`\n${question}\n`);
    options.forEach((opt, i) => {
      const checked = preselected.includes(opt.value) ? '✓' : ' ';
      output.write(`  ${i + 1}) [${checked}] ${opt.label}\n`);
    });
    output.write('\nType numbers separated by space, or `all`, or empty for the preselected set.\n> ');
    const ans = (await rl.question('')).trim();
    if (ans === '') return preselected;
    if (ans === 'all') return options.map((o) => o.value);
    const idxs = ans.split(/\s+/).map((s) => Number.parseInt(s, 10) - 1).filter((n) => Number.isInteger(n) && n >= 0 && n < options.length);
    return idxs.map((i) => options[i].value);
  } finally {
    rl.close();
  }
}

export async function ask(question, fallback) {
  if (!input.isTTY) return fallback;
  const rl = readline.createInterface({ input, output });
  try {
    const ans = (await rl.question(`${question}${fallback ? ` [${fallback}] ` : ' '}`)).trim();
    return ans === '' ? fallback : ans;
  } finally {
    rl.close();
  }
}
