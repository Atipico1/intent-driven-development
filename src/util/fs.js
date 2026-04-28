import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ASSETS_DIR = path.resolve(__dirname, '../../assets');

export function readAsset(rel) {
  return fs.readFileSync(path.join(ASSETS_DIR, rel), 'utf8');
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function writeFileIfMissing(p, content, { force = false } = {}) {
  if (fs.existsSync(p) && !force) return { written: false, reason: 'exists' };
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content);
  return { written: true };
}

export function appendIfNotPresent(p, marker, content) {
  ensureDir(path.dirname(p));
  if (fs.existsSync(p)) {
    const cur = fs.readFileSync(p, 'utf8');
    if (cur.includes(marker)) return { written: false, reason: 'already-present' };
    fs.writeFileSync(p, cur.replace(/\s*$/, '') + '\n\n' + content);
    return { written: true, mode: 'appended' };
  }
  fs.writeFileSync(p, content);
  return { written: true, mode: 'created' };
}

export function chmodExec(p) {
  fs.chmodSync(p, 0o755);
}
