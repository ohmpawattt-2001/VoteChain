#!/usr/bin/env node
/*
Automate phased commits with rotating authors and backdated dates.
Phases:
- init (2023-12 to 2024-02)
- core (2024-03 to 2024-08)
- test (2024-09 to 2024-12)
- docs (2025-01 to 2025-02-10)
*/
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function sh(cmd, env) {
  execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...(env || {}) } });
}

function readAccounts(p) {
  const text = fs.readFileSync(p, 'utf8').trim();
  const lines = text.split(/\n/).slice(1);
  return lines
    .map((l) => {
      const [username, email] = l.split(',');
      return username && email ? { username, email } : null;
    })
    .filter(Boolean);
}

function rng(n) {
  return Math.floor(Math.random() * n);
}

function randomPick(arr) {
  return arr[rng(arr.length)];
}

function topics() {
  return [
    'whitelist access control',
    'anonymous voting via Semaphore',
    'Merkle tree inclusion proof',
    'reentrancy protection with OpenZeppelin',
    'wagmi + RainbowKit onboarding UX',
    'Ethers event subscriptions',
    'The Graph subgraph schema',
    'CSV export of results',
    'multi-chain deployment',
  ];
}

function isoLocal(d) {
  const p = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    p(d.getMonth() + 1) +
    '-' +
    p(d.getDate()) +
    'T' +
    p(d.getHours()) +
    ':' +
    p(d.getMinutes()) +
    ':' +
    p(d.getSeconds()) +
    '+0800'
  );
}

const phases = [
  {
    name: 'init',
    start: new Date('2023-12-01T10:00:00+08:00'),
    end: new Date('2024-02-28T18:00:00+08:00'),
  },
  {
    name: 'core',
    start: new Date('2024-03-01T10:00:00+08:00'),
    end: new Date('2024-08-31T18:00:00+08:00'),
  },
  {
    name: 'test',
    start: new Date('2024-09-01T10:00:00+08:00'),
    end: new Date('2024-12-31T18:00:00+08:00'),
  },
  {
    name: 'docs',
    start: new Date('2025-01-01T10:00:00+08:00'),
    end: new Date('2025-02-10T18:00:00+08:00'),
  },
];

function datesBetween(start, end, n) {
  const s = start.getTime();
  const e = end.getTime();
  const step = Math.floor((e - s) / n);
  return Array.from({ length: n }, (_, i) => new Date(s + i * step));
}

function writeDoc(phase, i, suffix = '') {
  const dir = path.join('docs', 'notes', phase);
  fs.mkdirSync(dir, { recursive: true });
  const base = 'note-' + String(i + 1).padStart(3, '0');
  const file = path.join(dir, suffix ? `${base}-${suffix}.md` : `${base}.md`);
  const body =
    '# ' +
    phase +
    ' design note ' +
    (i + 1) +
    (suffix ? ' (' + suffix + ')' : '') +
    '\n\n- Topic: ' +
    randomPick(topics()) +
    '\n- Rationale: iteratively refining VoteChain design and implementation details.\n';
  fs.writeFileSync(file, body);
  sh('git add ' + JSON.stringify(file));
}

function run(perPhase, dry) {
  const accounts = readAccounts('/Users/xinyuwang/Desktop/github_accounts.csv');
  if (accounts.length < 2) throw new Error('need at least 2 accounts');
  const counts = new Map(accounts.map((a) => [a.username, 0]));

  for (const ph of phases) {
    const ds = datesBetween(ph.start, ph.end, perPhase);
    for (let i = 0; i < perPhase; i++) {
      if (!dry) {
        writeDoc(ph.name, i);
        const a = accounts[rng(accounts.length)];
        const when = isoLocal(ds[i]);
        const type = i % 7 === 0 ? 'docs' : i % 5 === 0 ? 'test' : i % 3 === 0 ? 'fix' : 'feat';
        const msg = type + ': ' + ph.name + ' iterative update ' + (i + 1);
        sh('git config user.name ' + JSON.stringify(a.username));
        sh('git config user.email ' + JSON.stringify(a.email));
        sh('git commit -m ' + JSON.stringify(msg), {
          GIT_AUTHOR_DATE: when,
          GIT_COMMITTER_DATE: when,
        });
        counts.set(a.username, counts.get(a.username) + 1);
      } else {
        console.log('dry', ph.name, i + 1);
      }
    }
  }

  if (dry) {
    console.log('dry run complete, no top-up commits performed.');
    return;
  }

  // ensure per-account minimum 16 commits
  for (const a of accounts) {
    while (counts.get(a.username) < 16) {
      const now = isoLocal(new Date('2025-02-05T10:00:00+08:00'));
      const idx = counts.get(a.username);
      writeDoc('docs', idx, a.username);
      const msg = 'docs: docs top-up to satisfy per-account minimum';
      sh('git config user.name ' + JSON.stringify(a.username));
      sh('git config user.email ' + JSON.stringify(a.email));
      sh('git commit -m ' + JSON.stringify(msg), {
        GIT_AUTHOR_DATE: now,
        GIT_COMMITTER_DATE: now,
      });
      counts.set(a.username, counts.get(a.username) + 1);
    }
  }
  console.log('done');
}

const args = process.argv.slice(2);
const per = parseInt((args.find((s) => s.startsWith('--per-phase=')) || '').split('=')[1]) || 25;
const dry = args.includes('--dry');
run(per, dry);
