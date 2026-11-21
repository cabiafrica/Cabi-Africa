#!/usr/bin/env node
/**
 * sync-obsidian-vault.js
 *
 * Publishes the "core docs" of the Cabi Africa repo into an external Obsidian
 * vault, keeping the repo and vault as separate stores (the vault is the
 * reading surface, the repo remains the source of truth).
 *
 * Scope (core docs only):
 *   - docs/architecture/**        (architecture reference)
 *   - docs/prd.md, docs/prd-unified/**, docs/prd/**
 *   - docs/*.epic.md             (driver-group, ride-dispatch, mlm-commission)
 *   - docs/Story Archives/**
 *
 * Destination: <VAULT>/CABi Africa/<mirrored-path>
 *
 * Usage:
 *   node scripts/sync-obsidian-vault.js            # run sync
 *   node scripts/sync-obsidian-vault.js --dry-run  # preview only
 *   node scripts/sync-obsidian-vault.js --no-index  # skip index generation
 *
 * Env overrides:
 *   VAULT_PATH   (default ../../iBN-Cabi Vault)
 *   REPO_DOCS    (default ../docs relative to this script's repo root)
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const DEFAULT_VAULT = path.resolve(REPO_ROOT, '..', 'iBN-Cabi Vault');

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const noIndex = args.includes('--no-index');
const VAULT = path.resolve(process.env.VAULT_PATH || DEFAULT_VAULT);
const REPO_DOCS = path.resolve(process.env.REPO_DOCS || path.join(REPO_ROOT, 'docs'));
const OUT_DIR = path.join(VAULT, 'CABi Africa');

// Source groups: [relativeGlobRoot, matchFn]
const SOURCE_SETS = [
  { name: 'Architecture', root: 'architecture' },
  { name: 'PRD', root: 'prd' },
  { name: 'PRD (unified)', root: 'prd-unified' },
  { name: 'Epics', root: '.', pattern: /\.epic\.md$/ },
  { name: 'Story Archives', root: 'Story Archives' },
];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function collect() {
  const files = [];
  for (const set of SOURCE_SETS) {
    const root = path.join(REPO_DOCS, set.root);
    if (!fs.existsSync(root)) continue;
    if (set.pattern) {
      for (const f of walk(root, [])) if (set.pattern.test(f)) files.push(f);
    } else {
      files.push(...walk(root, []));
    }
  }
  // also the standalone docs/prd.md
  const prdMd = path.join(REPO_DOCS, 'prd.md');
  if (fs.existsSync(prdMd)) files.push(prdMd);
  return [...new Set(files)];
}

function copyFile(src, dest, log) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (dryRun) {
    log.push(`(dry) ${path.relative(REPO_ROOT, src)} -> ${path.relative(VAULT, dest)}`);
    return;
  }
  fs.copyFileSync(src, dest);
  log.push(`${path.relative(REPO_ROOT, src)} -> ${path.relative(VAULT, dest)}`);
}

function buildIndex(grouped) {
  const lines = [
    '---',
    'project: CABi Africa',
    'type: vault-sync-index',
    'source: "Cabi Africa repo (docs/)"',
    `generated: ${new Date().toISOString().slice(0, 10)}`,
    'tags:',
    '  - project/cabi',
    '---',
    '',
    '# CABi Africa — Synced Docs',
    '',
    '> Auto-generated index of core repo docs mirrored into this vault by `scripts/sync-obsidian-vault.js`.',
    '> The repo remains the source of truth; re-run the sync to refresh.',
    '',
  ];
  for (const [group, files] of grouped) {
    lines.push(`## ${group}`);
    lines.push('');
    for (const f of files) {
      const rel = path.relative(OUT_DIR, f).replace(/\\/g, '/');
      const name = path.basename(f, '.md');
      lines.push(`- [[${rel}|${name}]]`);
    }
    lines.push('');
  }
  if (dryRun) {
    console.log('(dry) would write index: CABi Africa/00 - Synced Docs Index.md');
  } else {
    fs.writeFileSync(path.join(OUT_DIR, '00 - Synced Docs Index.md'), lines.join('\n'), 'utf8');
  }
}

function main() {
  if (!fs.existsSync(VAULT)) {
    console.error(`Vault not found: ${VAULT}`);
    process.exit(1);
  }
  if (!fs.existsSync(REPO_DOCS)) {
    console.error(`Repo docs not found: ${REPO_DOCS}`);
    process.exit(1);
  }

  const files = collect();
  const log = [];
  const grouped = new Map();

  if (!dryRun) fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const src of files) {
    const rel = path.relative(REPO_DOCS, src);
    const dest = path.join(OUT_DIR, rel);
    copyFile(src, dest, log);

    const groupName =
      SOURCE_SETS.find((s) =>
        s.root === '.' ? s.pattern && s.pattern.test(src) : rel.replace(/\\/g, '/').startsWith(s.root)
      )?.name || 'Other';
    if (!grouped.has(groupName)) grouped.set(groupName, []);
    grouped.get(groupName).push(dest);
  }

  if (!noIndex) buildIndex(grouped);

  console.log(`${dryRun ? '[DRY RUN] ' : ''}Synced ${files.length} files -> ${path.relative(REPO_ROOT, OUT_DIR)}`);
  for (const l of log) console.log('  ' + l);
}

main();
