import fs from 'node:fs';
import { ensureDir } from './fs.js';
import path from 'node:path';

export function readJsonOr(p, fallback) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return fallback;
  }
}

export function mergeJsonFile(p, patch) {
  const existing = readJsonOr(p, {});
  const merged = deepMerge(existing, patch);
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(merged, null, 2) + '\n');
  return merged;
}

function deepMerge(a, b) {
  if (Array.isArray(a) && Array.isArray(b)) return uniq([...a, ...b]);
  if (isObj(a) && isObj(b)) {
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k]);
    return out;
  }
  return b ?? a;
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);

function uniq(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    const k = typeof v === 'string' ? v : JSON.stringify(v);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}
