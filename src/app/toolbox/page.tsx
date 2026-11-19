'use client';

import { useState } from 'react';
import {
  Wrench,
  Code,
  KeyRound,
  Binary,
  Hash,
  Clock,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function ToolboxPage() {
  const [activeTool, setActiveTool] = useState<'json' | 'jwt' | 'base64' | 'uuid' | 'timestamp' | 'regex'>('json');
  const [copied, setCopied] = useState(false);

  // JSON Tool State
  const [jsonInput, setJsonInput] = useState('{"project":"DevOS","status":"active","stats":{"stars":142,"openPRs":3}}');
  const [jsonOutput, setJsonOutput] = useState('');
  const [jsonError, setJsonError] = useState('');

  // JWT Tool State
  const [jwtInput, setJwtInput] = useState('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfZGV2b3Nfcm9vdCIsIm5hbWUiOiJMZWFkIEVuZ2luZWVyIiwiaWF0IjoxNTE2MjM5MDIyLCJyb2xlIjoiYWRtaW4ifQ.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk');
  const [jwtHeader, setJwtHeader] = useState('');
  const [jwtPayload, setJwtPayload] = useState('');
  const [jwtError, setJwtError] = useState('');

  // Base64 Tool State
  const [base64Input, setBase64Input] = useState('Hello DevOS Developer');
  const [base64Output, setBase64Output] = useState('');

  // UUID Tool State
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);

  // Timestamp Tool State
  const [epochInput, setEpochInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [humanDate, setHumanDate] = useState('');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // JSON Formatter
  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError('');
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  const handleMinifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError('');
    } catch (err: unknown) {
      setJsonError(err instanceof Error ? err.message : 'Invalid JSON');
    }
  };

  // JWT Decoder
  const handleDecodeJwt = () => {
    try {
      const parts = jwtInput.trim().split('.');
      if (parts.length !== 3) {
        throw new Error('JWT must have 3 dot-separated parts: header.payload.signature');
      }
      const decodeBase64Url = (str: string) => {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) base64 += '=';
        return atob(base64);
      };
      const headerObj = JSON.parse(decodeBase64Url(parts[0]));
      const payloadObj = JSON.parse(decodeBase64Url(parts[1]));
      setJwtHeader(JSON.stringify(headerObj, null, 2));
      setJwtPayload(JSON.stringify(payloadObj, null, 2));
      setJwtError('');
    } catch (err: unknown) {
      setJwtError(err instanceof Error ? err.message : 'Malformed JWT');
    }
  };

  // Base64 Encoder / Decoder
  const handleEncodeBase64 = () => {
    try {
      setBase64Output(btoa(base64Input));
    } catch (err: unknown) {
      setBase64Output('Encoding error: ' + (err instanceof Error ? err.message : 'Unknown'));
    }
  };

  const handleDecodeBase64 = () => {
    try {
      setBase64Output(atob(base64Input));
    } catch (err: unknown) {
      setBase64Output('Decoding error: ' + (err instanceof Error ? err.message : 'Invalid Base64'));
    }
  };

  // UUID Generator
  const handleGenerateUuids = (count: number = 5) => {
    const list = Array.from({ length: count }, () => crypto.randomUUID());
    setGeneratedUuids(list);
  };

  // Timestamp Converter
  const handleConvertTimestamp = () => {
    const epoch = Number(epochInput);
    if (!isNaN(epoch)) {
      const date = new Date(epoch > 1e11 ? epoch : epoch * 1000);
      setHumanDate(date.toUTCString() + ' (' + date.toLocaleString() + ')');
    }
  };

  const tools = [
    { id: 'json', name: 'JSON Formatter & Validator', icon: Code },
    { id: 'jwt', name: 'JWT Token Debugger', icon: KeyRound },
    { id: 'base64', name: 'Base64 Encoder / Decoder', icon: Binary },
    { id: 'uuid', name: 'UUID v4 Generator', icon: Hash },
    { id: 'timestamp', name: 'Unix Epoch & Timestamp', icon: Clock },
  ] as const;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Developer Offline Toolbox</span>
          </h2>
          <p className="text-xs text-surface-400">
            Zero-latency, 100% offline utilities. No data ever leaves your local environment.
          </p>
        </div>

        <span className="pill-badge bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
          ● Secure Local Sandbox
        </span>
      </div>

      {/* Tool Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-white/[0.06]">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-brand-600 text-white font-semibold shadow-glow-sm'
                  : 'bg-surface-900/60 text-surface-400 hover:text-white hover:bg-surface-850 border border-white/[0.05]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tool.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tool Area */}
      <div className="card-linear p-6 space-y-5">
        {/* JSON Tool */}
        {activeTool === 'json' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                JSON Input / Raw String
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleFormatJson}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all"
                >
                  Beautify (Indent 2)
                </button>
                <button
                  onClick={handleMinifyJson}
                  className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-300 hover:text-white text-xs font-medium border border-white/[0.08] transition-all"
                >
                  Minify
                </button>
              </div>
            </div>

            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={6}
              className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-surface-200 focus:outline-none focus:border-brand-500"
            />

            {jsonError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{jsonError}</span>
              </div>
            )}

            {jsonOutput && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-emerald-400 font-bold">✓ Valid Formatted JSON</span>
                  <button
                    onClick={() => copyToClipboard(jsonOutput)}
                    className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white font-mono"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] font-mono text-xs text-brand-200 overflow-x-auto max-h-96">
                  {jsonOutput}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* JWT Tool */}
        {activeTool === 'jwt' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                Paste Encoded JWT Token
              </h3>
              <button
                onClick={handleDecodeJwt}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium transition-all"
              >
                Decode Token
              </button>
            </div>

            <textarea
              value={jwtInput}
              onChange={(e) => setJwtInput(e.target.value)}
              rows={3}
              className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-surface-200 focus:outline-none focus:border-brand-500"
            />

            {jwtError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{jwtError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-purple-400">Decoded Header</span>
                <pre className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] font-mono text-xs text-purple-200 overflow-x-auto min-h-[140px]">
                  {jwtHeader || '// Click "Decode Token" to view'}
                </pre>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono font-bold text-brand-400">Decoded Payload Claims</span>
                <pre className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] font-mono text-xs text-brand-200 overflow-x-auto min-h-[140px]">
                  {jwtPayload || '// Click "Decode Token" to view'}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Base64 Tool */}
        {activeTool === 'base64' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                Input Text
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleEncodeBase64}
                  className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium"
                >
                  Encode to Base64
                </button>
                <button
                  onClick={handleDecodeBase64}
                  className="px-3 py-1.5 rounded-lg bg-surface-800 hover:bg-surface-700 text-surface-200 text-xs font-medium border border-white/[0.08]"
                >
                  Decode from Base64
                </button>
              </div>
            </div>

            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              rows={4}
              className="w-full bg-surface-950 border border-white/[0.08] rounded-xl p-3 font-mono text-xs text-surface-200 focus:outline-none focus:border-brand-500"
            />

            {base64Output && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-brand-400 font-bold">Result</span>
                  <button
                    onClick={() => copyToClipboard(base64Output)}
                    className="flex items-center gap-1.5 text-xs text-surface-400 hover:text-white font-mono"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] font-mono text-xs text-surface-200 overflow-x-auto">
                  {base64Output}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* UUID Tool */}
        {activeTool === 'uuid' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                Cryptographically Secure UUID v4
              </h3>
              <button
                onClick={() => handleGenerateUuids(5)}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium"
              >
                Generate 5 UUIDs
              </button>
            </div>

            <div className="space-y-2">
              {generatedUuids.length === 0 ? (
                <div className="py-8 text-center text-xs text-surface-500 font-mono">
                  Click &ldquo;Generate 5 UUIDs&rdquo; to produce standard RFC 4122 v4 UUIDs.
                </div>
              ) : (
                generatedUuids.map((id) => (
                  <div
                    key={id}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-950 border border-white/[0.06] font-mono text-xs text-surface-200"
                  >
                    <span>{id}</span>
                    <button
                      onClick={() => copyToClipboard(id)}
                      className="p-1 rounded bg-surface-800 text-surface-400 hover:text-white"
                      title="Copy UUID"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Timestamp Tool */}
        {activeTool === 'timestamp' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-surface-400">
                Epoch Timestamp Converter
              </h3>
              <button
                onClick={handleConvertTimestamp}
                className="px-3.5 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-medium"
              >
                Convert Timestamp
              </button>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={epochInput}
                onChange={(e) => setEpochInput(e.target.value)}
                placeholder="Unix Epoch in seconds or milliseconds..."
                className="flex-1 bg-surface-950 border border-white/[0.08] rounded-xl px-3 py-2 font-mono text-xs text-surface-200 focus:outline-none focus:border-brand-500"
              />
              <button
                onClick={() => {
                  const now = String(Math.floor(Date.now() / 1000));
                  setEpochInput(now);
                }}
                className="px-3 py-2 rounded-xl bg-surface-800 text-xs font-mono text-surface-300 hover:text-white border border-white/[0.08]"
              >
                Set Current Time
              </button>
            </div>

            {humanDate && (
              <div className="p-4 rounded-xl bg-surface-950 border border-white/[0.08] space-y-1">
                <span className="text-[10px] font-mono text-surface-500 uppercase tracking-wider">
                  Human Formatted Date & Time
                </span>
                <p className="text-sm font-mono font-bold text-brand-300">{humanDate}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
