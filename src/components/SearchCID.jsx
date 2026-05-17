import React, { useState, useEffect } from 'react';
import { Search, Download, Layers, Globe, ExternalLink, AlertCircle } from 'lucide-react';
import { searchCID, getDownloadUrl } from '../services/api';

export default function SearchCID({ activeNodeUrl, initialCid }) {
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (initialCid) {
      setCid(initialCid);
      handleSearch(initialCid);
    }
  }, [initialCid]);

  const handleSearch = async (targetCid) => {
    const query = targetCid || cid;
    if (!query) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await searchCID(activeNodeUrl, query);
      setResult(data);
    } catch (err) {
      setError(err.response?.data || err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 text-left relative">
      <div className="flex items-center gap-2 mb-4">
        <Search size={20} className="text-blue-400" />
        <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">Kademlia DHT Resolver & Downloader</h3>
      </div>

      {/* Input query field */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="Enter SHA-256 Content ID (root CID or block CID)"
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500/50"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search size={14} className="absolute left-3 top-3.5 text-slate-500" />
        </div>
        <button
          onClick={() => handleSearch()}
          disabled={loading || !cid}
          className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold tracking-wide transition-colors flex items-center gap-2 shadow-lg shadow-blue-500/20"
        >
          {loading ? 'Resolving...' : 'Lookup'}
        </button>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2 font-mono">
          <AlertCircle size={14} /> <span>{typeof error === 'string' ? error : JSON.stringify(error)}</span>
        </div>
      )}

      {/* Lookup results panel */}
      {result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-slate-800/80 pt-4 animate-fade-in">
          {/* Metadata inspection */}
          <div className="md:col-span-2 font-mono text-xs">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block mb-2 uppercase tracking-wider">
              Merkle DAG Block Inspection
            </span>
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {result.inspect || 'Raw untyped storage block'}
            </div>

            {/* Direct download action if file type is root */}
            <div className="mt-4">
              <a
                href={getDownloadUrl(activeNodeUrl, result.cid)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-semibold tracking-wide transition-colors shadow"
              >
                <Download size={14} /> Reconstruct & Download File Payload
              </a>
            </div>
          </div>

          {/* Advertised Providers */}
          <div className="font-mono text-xs border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
            <span className="text-slate-400 font-sans font-semibold text-[11px] block mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={12} /> Registered Providers
            </span>
            {(!result.providers || result.providers.length === 0) ? (
              <span className="text-slate-600 italic block py-2 font-sans">No cached overlay provider hints found.</span>
            ) : (
              <ul className="space-y-2">
                {result.providers.map((p, idx) => (
                  <li key={idx} className="p-2 bg-slate-950/40 rounded border border-slate-900 text-slate-400 truncate" title={p.peer_id}>
                    <div className="text-[10px] text-purple-400 truncate font-semibold mb-0.5 font-sans">
                      Peer: {p.peer_id?.slice(0, 10)}...
                    </div>
                    <div className="text-[10px] flex items-center gap-1">
                      <span className="text-slate-500">gRPC:</span> {p.grpc_addr}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
