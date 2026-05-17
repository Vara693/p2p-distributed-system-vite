import React, { useState } from 'react';
import { Network, Server, Wifi, WifiOff, UserX } from 'lucide-react';

export default function PeerGraph({ peers = [], graph = { edges: [] }, currentPeerId }) {
  const [selectedPeer, setSelectedPeer] = useState(null);

  // Compute positions for active online nodes dynamically in a circular ring layout
  const radius = 120;
  const center = 160;
  // Filter only existing nodes part of the system
  const validPeers = peers.filter(p => p && p.id);
  const totalNodes = Math.max(validPeers.length, 1);

  const nodePositions = validPeers.reduce((acc, p, i) => {
    const angle = (i / totalNodes) * 2 * Math.PI - Math.PI / 2;
    acc[p.id] = {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
      label: p.id.slice(0, 4),
      ...p,
    };
    return acc;
  }, {});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Topology Circle Ring Map */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 lg:col-span-1 flex flex-col">
        <div className="flex items-center gap-2 mb-4">
          <Network size={18} className="text-brand-400" />
          <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">Kademlia Active Ring</h3>
        </div>
        
        <div className="relative flex-1 flex items-center justify-center min-h-[320px]">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 320">
            {/* Draw overlay ring background */}
            <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="30" />
            <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />

            {/* Draw Dynamic Connectivity Edges */}
            {(graph.edges || []).map((edge, idx) => {
              const source = nodePositions[edge[0]];
              const target = nodePositions[edge[1]];
              if (!source || !target) return null;
              return (
                <line
                  key={idx}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="rgba(34, 197, 94, 0.25)"
                  strokeWidth="1.5"
                />
              );
            })}

            {/* Draw Dynamic Online Nodes */}
            {Object.values(nodePositions).map((node) => {
              const isSelf = node.id === currentPeerId;
              const isActive = node.state === 'active';
              const isSelected = selectedPeer?.id === node.id;

              let bg = isActive ? '#22c55e' : '#f59e0b';
              if (node.state === 'left') bg = '#ef4444';

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform hover:scale-125"
                  onClick={() => setSelectedPeer(node)}
                >
                  {isSelf && (
                    <circle r="18" fill="none" stroke="#a855f7" strokeWidth="2" className="animate-ping opacity-75" />
                  )}
                  <circle
                    r={isSelected ? "14" : "12"}
                    fill={isSelf ? "#a855f7" : bg}
                    stroke={isSelected ? "#fff" : "#0f172a"}
                    strokeWidth="2"
                  />
                  <text
                    y="24"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                    className="select-none font-semibold"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}

            {validPeers.length === 0 && (
              <text x={center} y={center} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="sans-serif">
                Awaiting node cluster registrations...
              </text>
            )}
          </svg>
        </div>

        <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-400 border-t border-slate-900/50 pt-3">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Local Gateway</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-brand-500 inline-block"></span> Active</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Inactive</span>
        </div>
      </div>

      {/* Peer Matrix List */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 lg:col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server size={18} className="text-purple-400" />
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase">Online Systems Registry ({validPeers.length}/20)</h3>
          </div>
          {selectedPeer && (
            <button
              onClick={() => setSelectedPeer(null)}
              className="text-xs text-brand-400 hover:underline"
            >
              Clear Selection
            </button>
          )}
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-2.5 px-3 font-medium">Peer Hash ID (SHA-256)</th>
                <th className="py-2.5 px-3 font-medium">gRPC Endpoint</th>
                <th className="py-2.5 px-3 font-medium">HTTP Endpoint</th>
                <th className="py-2.5 px-3 font-medium text-center">Lifecycle State</th>
                <th className="py-2.5 px-3 font-medium text-right">Last Seen (UTC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {validPeers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-slate-500 italic font-sans">
                    No remote peers discovered yet. Enter Cloud IP Gateway to sync overlay table...
                  </td>
                </tr>
              ) : (
                validPeers.map((p) => {
                  const isSelf = p.id === currentPeerId;
                  const isSelected = selectedPeer?.id === p.id;
                  
                  let stateBadge = (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                      <Wifi size={10} /> Active
                    </span>
                  );
                  if (p.state === 'inactive') {
                    stateBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px]">
                        <WifiOff size={10} /> Inactive
                      </span>
                    );
                  } else if (p.state === 'left') {
                    stateBadge = (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]">
                        <UserX size={10} /> Left
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-900/40 transition-colors ${isSelected ? 'bg-purple-500/10 border-l-2 border-purple-500' : ''}`}
                    >
                      <td className="py-3 px-3 font-medium text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[120px]" title={p.id}>{p.id}</span>
                          {isSelf && (
                            <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded text-[9px] border border-purple-500/30 font-sans">gateway</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-400">{p.grpc_addr || '—'}</td>
                      <td className="py-3 px-3 text-slate-400">{p.http_addr || '—'}</td>
                      <td className="py-3 px-3 text-center">{stateBadge}</td>
                      <td className="py-3 px-3 text-right text-slate-500">{p.last_seen ? p.last_seen.split('T')[1]?.replace('Z','') : '—'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selectedPeer && (
          <div className="mt-4 p-3 bg-slate-950/60 rounded-lg border border-slate-800 text-xs text-left font-mono">
            <span className="text-brand-400 font-sans font-semibold block mb-1">Selected System Node Detail:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-400">
              <div><strong className="text-slate-500">ID:</strong> {selectedPeer.id}</div>
              <div><strong className="text-slate-500">State:</strong> {selectedPeer.state}</div>
              <div><strong className="text-slate-500">gRPC:</strong> {selectedPeer.grpc_addr}</div>
              <div><strong className="text-slate-500">HTTP:</strong> {selectedPeer.http_addr}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
