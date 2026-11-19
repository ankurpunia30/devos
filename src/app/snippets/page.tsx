'use client';

import { useState } from 'react';
import { Terminal, Copy, Check, Search, Plus, Tag, Code2, X } from 'lucide-react';

interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
}

const initialSnippets: Snippet[] = [
  {
    id: 'snip-1',
    title: 'PostgreSQL Recursive CTE for Tree Traversal',
    description: 'Traverses hierarchical comment trees or organizational org charts in one database query.',
    language: 'sql',
    code: `WITH RECURSIVE CommentTree AS (
  SELECT id, parent_id, content, 1 as depth
  FROM comments WHERE parent_id IS NULL
  UNION ALL
  SELECT c.id, c.parent_id, c.content, ct.depth + 1
  FROM comments c
  JOIN CommentTree ct ON c.parent_id = ct.id
)
SELECT * FROM CommentTree ORDER BY depth ASC;`,
    tags: ['database', 'postgres', 'cte'],
  },
  {
    id: 'snip-2',
    title: 'Redis Distributed Token Bucket Rate Limiter',
    description: 'Sliding window / token bucket rate limiter in TypeScript using Redis pipelines.',
    language: 'typescript',
    code: `import Redis from 'ioredis';

export async function checkRateLimit(redis: Redis, key: string, limit: number, windowSeconds: number): Promise<boolean> {
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return current <= limit;
}`,
    tags: ['redis', 'backend', 'system-design'],
  },
  {
    id: 'snip-3',
    title: 'Docker Multi-Stage Node.js Production Build',
    description: 'Minimal Alpine-based production container with non-root security user.',
    language: 'docker',
    code: `FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]`,
    tags: ['docker', 'devops', 'security'],
  },
  {
    id: 'snip-4',
    title: 'Python Fast LRU Cache Decorator',
    description: 'In-memory LRU cache with TTL expiration for expensive algorithmic functions.',
    language: 'python',
    code: `from functools import lru_cache
import time

@lru_cache(maxsize=1024)
def compute_fibonacci(n: int) -> int:
    if n < 2:
        return n
    return compute_fibonacci(n - 1) + compute_fibonacci(n - 2)`,
    tags: ['python', 'algorithms', 'cache'],
  },
];

export default function SnippetsPage() {
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // New Snippet form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLang, setNewLang] = useState('typescript');
  const [newCode, setNewCode] = useState('');

  const handleCopy = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddSnippet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCode.trim()) return;

    const newSnip: Snippet = {
      id: `snip-${Date.now()}`,
      title: newTitle,
      description: newDesc,
      language: newLang,
      code: newCode,
      tags: [newLang],
    };

    setSnippets([newSnip, ...snippets]);
    setNewTitle('');
    setNewDesc('');
    setNewCode('');
    setShowModal(false);
  };

  const languages = ['all', 'typescript', 'sql', 'python', 'docker'];

  const filtered = snippets.filter((s) => {
    const matchesLang = selectedLanguage === 'all' || s.language === selectedLanguage;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLang && matchesSearch;
  });

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Code Snippet Vault</span>
          </h2>
          <p className="text-xs text-surface-400">
            Personal vault of verified algorithms, infrastructure patterns & SQL queries
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Snippet</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code snippets, algorithms, or SQL..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center gap-1 bg-surface-900 p-1 rounded-xl border border-white/[0.08]">
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-mono uppercase transition-all ${
                selectedLanguage === lang
                  ? 'bg-brand-600 text-white font-bold shadow-sm'
                  : 'text-surface-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Snippets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((snippet) => (
          <div
            key={snippet.id}
            className="card-linear p-5 space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-bold text-white leading-snug">
                    {snippet.title}
                  </h3>
                  <p className="text-xs text-surface-400 leading-relaxed">
                    {snippet.description}
                  </p>
                </div>
                <span className="pill-badge bg-brand-500/10 text-brand-300 border-brand-500/20 uppercase shrink-0">
                  {snippet.language}
                </span>
              </div>

              {/* Code Container */}
              <div className="relative group/code rounded-xl overflow-hidden border border-white/[0.06] bg-surface-950">
                <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/[0.05] bg-surface-925 text-[10px] font-mono text-surface-500">
                  <span>{snippet.language}</span>
                  <button
                    onClick={() => handleCopy(snippet.id, snippet.code)}
                    className="flex items-center gap-1 text-surface-400 hover:text-white transition-colors"
                  >
                    {copiedId === snippet.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3.5 font-mono text-xs text-brand-200 overflow-x-auto leading-relaxed max-h-64">
                  <code>{snippet.code}</code>
                </pre>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.04] flex-wrap">
              {snippet.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-md bg-surface-800 text-[10px] font-mono text-surface-400 border border-white/[0.04]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* New Snippet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Save Code Snippet</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddSnippet} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Lock with Redlock Algorithm"
                  required
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Language</label>
                  <select
                    value={newLang}
                    onChange={(e) => setNewLang(e.target.value)}
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="sql">SQL</option>
                    <option value="docker">Docker</option>
                    <option value="bash">Bash</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono text-surface-400">Description</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Short description..."
                    className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Source Code</label>
                <textarea
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value)}
                  rows={6}
                  required
                  placeholder="Paste snippet code here..."
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-surface-200 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-surface-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save Snippet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
