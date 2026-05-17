import React, { useState, useEffect } from 'react';
import { Database, RefreshCw, Radio, Layers, ArrowRight, ShieldCheck, Globe, Cpu } from 'lucide-react';
import NetworkHealth from './components/NetworkHealth';
import PeerGraph from './components/PeerGraph';
import FileUpload from './components/FileUpload';
import SearchCID from './components/SearchCID';
import { getHealth, getPeers, getGraph, getCatalog } from './services/api';

export default function App() {
  const [joined, setJoined] = useState(false);
  const [inputIp, setInputIp] = useState('http://127.0.0.1:8080');
  const [activeNodeUrl, setActiveNodeUrl] = useState('');
  
  const [health, setHealth] = useState(null);
  const [peers, setPeers] = useState([]);
  const [graph, setGraph] = useState({ nodes: [], edges: [] });
  const [catalogCid, setCatalogCid] = useState('');
  const [polling, setPolling] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [error, setError] = useState(null);
  const [inspectedCid, setInspectedCid] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    let url = inputIp.trim();
    if (!url) return;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    setActiveNodeUrl(url);
    setJoined(true);
  };

  const fetchState = async () => {
    if (!activeNodeUrl || !joined) return;
    setError(null);
    try {
      const [hData, pData, gData, cData] = await Promise.all([
        getHealth(activeNodeUrl),
        getPeers(activeNodeUrl),
        getGraph(activeNodeUrl),
        getCatalog(activeNodeUrl).catch(() => ({ catalog_cid: '' })),
      ]);
      setHealth(hData);
      setPeers(pData || []);
      setGraph(gData || { nodes: [], edges: [] });
      setCatalogCid(cData?.catalog_cid || '');
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      setError(`Unable to reach Cloud Gateway API at ${activeNodeUrl}. Check network connectivity.`);
      setHealth(null);
    }
  };

  useEffect(() => {
    fetchState();
    let interval;
    if (polling && joined) {
      interval = setInterval(() => {
        fetchState();
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [activeNodeUrl, polling, joined]);

  const handleUploadComplete = (rootCid, catalogCid) => {
    if (catalogCid) setCatalogCid(catalogCid);
    setInspectedCid(rootCid);
    fetchState();
  };

  // Render premium Onboarding Landing Screen if user hasn't joined yet
  if (!joined) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glowing spots */}
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-xl w-full glass-panel p-8 rounded-2xl border border-slate-800 shadow-2xl relative z-10 text-center animate-fade-in">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-500/20 mb-6">
            <Database size={32} />
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            BitStock <span className="text-brand-400 font-mono text-sm block sm:inline mt-1 sm:mt-0">Global Cloud Access</span>
          </h1>
          <p className="text-sm text-slate-400 mb-8 max-w-md mx-auto leading-relaxed font-sans">
            Connect to the distributed IPFS-inspired overlay storage network. Enter an active Cloud Node Gateway IP to synchronize DHT lookup matrices instantly.
          </p>

          {/* Features Highlights Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8 text-left border-y border-slate-900 py-4 font-mono text-xs text-slate-400">
            <div className="flex flex-col items-center text-center">
              <Globe size={18} className="text-blue-400 mb-1.5" />
              <span>AWS Remote / Global IP Mesh</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <ShieldCheck size={18} className="text-brand-400 mb-1.5" />
              <span>Redis Cluster Auto-Discovery</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <Cpu size={18} className="text-purple-400 mb-1.5" />
              <span>Resilient Chunk Resumption</span>
            </div>
          </div>

          {/* Interactive Connect Form */}
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Target Cloud Gateway Endpoint
              </label>
              <input
                type="text"
                value={inputIp}
                onChange={(e) => setInputIp(e.target.value)}
                placeholder="e.g. http://54.210.85.12:8080 or http://127.0.0.1:8080"
                required
                className="w-full px-4 py-3 bg-slate-900 border border-slate-800 focus:border-brand-500/50 rounded-xl text-sm font-mono text-slate-100 focus:outline-none transition-colors text-center"
              />
              <span className="text-[10px] text-slate-500 block mt-1.5 text-center">
                Supports AWS Public IP endpoints mapped over standard network ports.
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-sans text-sm font-bold tracking-wide transition-all duration-300 shadow-xl shadow-brand-500/20 flex items-center justify-center gap-2 group"
            >
              Join Overlay Storage Network <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </form>
        </div>

        <div className="mt-8 text-center text-xs text-slate-600 font-mono">
          BitStock Protocol Subsystem • Capable of Dynamic Global Connection Swaps
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative overflow-x-hidden animate-fade-in">
      {/* Dynamic ambient header gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Premium Workspace Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg shadow-brand-500/20">
              <Database size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                BitStock <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">Cloud Mesh</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">Connected Gateway: <span className="text-brand-400 font-semibold">{activeNodeUrl}</span></p>
            </div>
          </div>

          {/* Disconnect & Polling Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setJoined(false); setHealth(null); }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-lg text-xs transition-colors font-medium"
              title="Disconnect back to Cloud entry gateway screen"
            >
              Disconnect
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPolling(!polling)}
                className={`p-2 rounded-lg border transition-colors ${
                  polling ? 'bg-brand-500/10 border-brand-500/30 text-brand-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
                title={polling ? 'Live gateway cluster polling active (3s)' : 'Polling paused'}
              >
                <Radio size={16} className={polling ? 'animate-pulse' : ''} />
              </button>

              <button
                onClick={fetchState}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Force manual refresh"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
            <span>{error}</span>
            <span className="text-[10px] text-amber-500 font-mono">Verify AWS IP endpoint port bindings are open</span>
          </div>
        )}

        {/* Live Top Metrics */}
        <NetworkHealth health={health} />

        {/* Live Topology visualizer & Dynamic Registry view */}
        <PeerGraph
          peers={peers}
          graph={graph}
          currentPeerId={health?.peer_id}
        />

        {/* Bottom Interactive Ingestion & Retrieval grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
          <FileUpload
            activeNodeUrl={activeNodeUrl}
            catalogCid={catalogCid}
            onUploadComplete={handleUploadComplete}
            onInspectCatalog={() => setInspectedCid(catalogCid)}
          />
          <SearchCID
            activeNodeUrl={activeNodeUrl}
            initialCid={inspectedCid}
          />
        </div>
      </main>

      {/* Exquisite Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Antigravity Distributed Systems. Multi-Node Resilient Chunk Architecture.</p>
          <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
            <span>Redis Auto-Sync</span>
            <span>•</span>
            <span>Seamless Path Recovery</span>
            <span>•</span>
            <span>20-Peer Network Bound</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
