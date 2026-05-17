import React, { useState } from 'react';
import { UploadCloud, CheckCircle2, Copy, Loader2, ArrowUpRight, FileText, Search } from 'lucide-react';
import { uploadFile } from '../services/api';

export default function FileUpload({ activeNodeUrl, catalogCid, onUploadComplete, onInspectCatalog }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [catalogCopied, setCatalogCopied] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(10);
    setError(null);
    try {
      const data = await uploadFile(activeNodeUrl, file, (evt) => {
        if (evt.total) {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        }
      });
      setResult(data);
      if (onUploadComplete) onUploadComplete(data.root_cid, data.catalog_cid);
    } catch (err) {
      setError(err.response?.data || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const copyCID = (cid, isCatalog = false) => {
    navigator.clipboard.writeText(cid);
    if (isCatalog) {
      setCatalogCopied(true);
      setTimeout(() => setCatalogCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl border border-slate-800 text-left relative overflow-hidden flex flex-col gap-6">
      
      {/* Global Catalog Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-inner">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <FileText size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-200">Global Registry Catalog</h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
              {catalogCid ? catalogCid : "Awaiting initial file upload to generate catalog..."}
            </p>
          </div>
        </div>
        
        {catalogCid && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => copyCID(catalogCid, true)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors flex items-center gap-1.5"
            >
              {catalogCopied ? <span className="text-brand-400 text-[10px]">Copied!</span> : <><Copy size={12}/> Copy CID</>}
            </button>
            <button
              onClick={onInspectCatalog}
              className="px-3 py-1.5 bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/30 text-brand-400 rounded text-xs transition-colors flex items-center gap-1.5"
            >
              <Search size={12} /> Inspect File
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <UploadCloud size={20} className="text-brand-400" />
        <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">Distributed DAG Ingestion</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Trigger Area */}
        <div>
          <label className="border-2 border-dashed border-slate-800 hover:border-brand-500/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-slate-950/40 group">
            <input type="file" className="hidden" onChange={handleFileChange} disabled={uploading} />
            <div className="p-3 bg-slate-900 rounded-full text-slate-400 group-hover:text-brand-400 group-hover:bg-brand-500/10 mb-3 transition-all">
              <UploadCloud size={28} />
            </div>
            <span className="text-sm font-medium text-slate-200 mb-1">
              {file ? file.name : 'Select file to chunk & replicate'}
            </span>
            <span className="text-xs text-slate-500">
              {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Content-addressed Merkle DAG storage'}
            </span>
          </label>

          {file && !uploading && !result && (
            <button
              onClick={handleUpload}
              className="mt-4 w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20"
            >
              Start Upload & Kademlia Replication <ArrowUpRight size={14} />
            </button>
          )}

          {uploading && (
            <div className="mt-4 p-4 bg-slate-950/60 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-brand-400" /> Chunking & Distributing...
                </span>
                <span className="font-mono text-brand-400 font-bold">{progress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              <strong>Error:</strong> {typeof error === 'string' ? error : JSON.stringify(error)}
            </div>
          )}
        </div>

        {/* Output & Replication Metrics summary */}
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Ingestion Workflow Trace</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></span>
                <span>File split into 256KB binary payload blocks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></span>
                <span>Canonical JSON Merkle DAG FileNode compiled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5"></span>
                <span>Local Provider Records advertised to DHT table</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-1.5"></span>
                <span>Replicated blocks to closest XOR-metric peers (3x)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5"></span>
                <span>Distributed Global Catalog Registry Updated safely</span>
              </li>
            </ul>
          </div>

          {result && (
            <div className="mt-4 p-3 bg-gradient-to-br from-brand-500/10 to-transparent rounded-xl border border-brand-500/30 font-mono text-xs animate-fade-in">
              <div className="flex items-center gap-1.5 text-brand-400 font-sans font-semibold mb-1.5">
                <CheckCircle2 size={14} /> Uploaded & Verified
              </div>
              <span className="text-slate-400 text-[10px] block mb-0.5">Root Content ID (SHA-256 hex):</span>
              <div className="flex items-center justify-between gap-2 p-2 bg-slate-950/80 rounded border border-slate-800 text-slate-200">
                <span className="truncate max-w-[180px] select-all">{result.root_cid}</span>
                <button
                  onClick={() => copyCID(result.root_cid)}
                  className="p-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy CID"
                >
                  {copied ? <span className="text-brand-400 text-[9px] font-sans">Copied!</span> : <Copy size={12} />}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
