'use client';

import { useState } from 'react';
import { BookOpen, Search, Plus, Tag, Calendar, Folder, FileText, Check, X } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  category: 'Architecture' | 'Database' | 'Debugging' | 'DSA' | 'System Design';
  tags: string[];
  content: string;
  updatedAt: string;
}

const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'PostgreSQL Indexing: B-Tree vs BRIN vs GiST',
    category: 'Database',
    tags: ['postgres', 'indexing', 'performance'],
    content: `## PostgreSQL Index Selection Guide

### 1. B-Tree (Default)
- Ideal for unique lookups, equality (\`=\`), and range queries (\`<, <=, >, >=\`).
- Supported by primary keys.
- **Cost**: High write amplification on frequent updates.

### 2. BRIN (Block Range Index)
- Ideal for massive append-only tables (e.g. telemetry, logs, time-series).
- Stores min/max values per disk page range (e.g. 128 pages).
- **Storage footprint**: 100x smaller than B-Tree.

### 3. GiST & GIN
- GiST: Spatial data, geometric searches.
- GIN: Full-text search, JSONB documents, array intersections.`,
    updatedAt: '2026-11-19',
  },
  {
    id: 'note-2',
    title: 'Distributed Consistency: Raft Leader Election',
    category: 'System Design',
    tags: ['distributed-systems', 'consensus', 'raft'],
    content: `## Raft Consensus Protocol

Raft decomposes consensus into 3 independent subproblems:
1. **Leader Election**: When an existing leader fails, a new leader must be elected.
2. **Log Replication**: The leader accepts log entries from clients and replicates them across followers.
3. **Safety**: If any server has applied a particular log entry to its state machine, no other server may apply a different log entry for the same log index.

### Election Timeout
- Followers convert to Candidate status if no heartbeat received within randomized timeout (150ms - 300ms).
- Randomized timeout prevents split-vote deadlock.`,
    updatedAt: '2026-11-18',
  },
  {
    id: 'note-3',
    title: 'Docker Bridge Networking DNS Resolution Failure',
    category: 'Debugging',
    tags: ['docker', 'networking', 'debugging'],
    content: `## Root Cause & Solution: Docker DNS Failure

### Symptoms
Containers could ping external IP addresses (e.g. \`8.8.8.8\`), but failed resolving hostnames with \`Could not resolve host\`.

### Resolution
1. Custom user-defined bridge networks include built-in DNS servers at \`127.0.0.11\`.
2. The default bridge network (\`bridge\`) does NOT support automatic service discovery by container name.
3. Fix: Always declare a named custom bridge in \`docker-compose.yml\`:
\`\`\`yaml
networks:
  devos-net:
    driver: bridge
\`\`\``,
    updatedAt: '2026-11-15',
  },
];

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [selectedNote, setSelectedNote] = useState<Note>(initialNotes[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);

  // Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<Note['category']>('Architecture');
  const [newContent, setNewContent] = useState('');

  const categories = ['all', 'Architecture', 'Database', 'Debugging', 'System Design'];

  const filtered = notes.filter((n) => {
    const matchesCat = selectedCategory === 'all' || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newN: Note = {
      id: `note-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      tags: [newCategory.toLowerCase()],
      content: newContent,
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setNotes([newN, ...notes]);
    setSelectedNote(newN);
    setNewTitle('');
    setNewContent('');
    setShowModal(false);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Developer Knowledge Base</span>
          </h2>
          <p className="text-xs text-surface-400">
            Personal engineering memory, debugging solutions, schemas & architecture specs
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>New Note</span>
        </button>
      </div>

      {/* Main 2-Column Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 spans): Note Index & Filters */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-surface-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineering knowledge..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-surface-900 border border-white/[0.08] text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono whitespace-nowrap transition-all ${
                  selectedCategory === c
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-surface-900 text-surface-400 hover:text-white border border-white/[0.05]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filtered.map((note) => {
              const isSelected = selectedNote.id === note.id;
              return (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-brand-500/10 border-brand-500/30 shadow-sm'
                      : 'bg-surface-900/60 border-white/[0.05] hover:bg-surface-850 hover:border-white/[0.1]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-white leading-snug line-clamp-1">
                      {note.title}
                    </h4>
                    <span className="pill-badge bg-surface-800 text-surface-400 border-white/[0.05] shrink-0">
                      {note.category}
                    </span>
                  </div>

                  <p className="text-[11px] text-surface-400 line-clamp-2 leading-relaxed">
                    {note.content.replace(/[#*`]/g, '')}
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-surface-500 pt-1">
                    <span>Updated: {note.updatedAt}</span>
                    <div className="flex gap-1">
                      {note.tags.map((t) => (
                        <span key={t}>#{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (7 spans): Note Markdown Reader */}
        <div className="lg:col-span-7 card-linear p-6 space-y-4 min-h-[500px]">
          <div className="flex items-start justify-between pb-4 border-b border-white/[0.06]">
            <div className="space-y-1">
              <span className="pill-badge bg-brand-500/10 text-brand-300 border-brand-500/20">
                {selectedNote.category}
              </span>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedNote.title}
              </h2>
              <div className="flex items-center gap-2 text-xs font-mono text-surface-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Last updated {selectedNote.updatedAt}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none font-sans text-xs text-surface-200 leading-relaxed whitespace-pre-wrap">
            {selectedNote.content}
          </div>
        </div>
      </div>

      {/* New Note Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-surface-900 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-sm font-bold text-white">Create Knowledge Note</h3>
              <button onClick={() => setShowModal(false)} className="text-surface-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Distributed Consensus: Paxos vs Raft"
                  required
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white placeholder-surface-500 focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as Note['category'])}
                  className="w-full bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                >
                  <option value="Architecture">Architecture</option>
                  <option value="Database">Database</option>
                  <option value="Debugging">Debugging</option>
                  <option value="System Design">System Design</option>
                  <option value="DSA">DSA</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-surface-400">Content (Markdown)</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={8}
                  required
                  placeholder="Write documentation, trade-offs, schemas, or debugging solutions..."
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
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
