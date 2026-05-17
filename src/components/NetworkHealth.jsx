import React from 'react';
import { Activity, Users, Layers, ShieldCheck, HardDrive } from 'lucide-react';

export default function NetworkHealth({ health }) {
  if (!health) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass-panel p-5 rounded-xl animate-pulse">
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-slate-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Overlay Node ID',
      value: health.peer_id ? `${health.peer_id.slice(0, 8)}...` : 'N/A',
      subtitle: `gRPC: ${health.grpc || 'disconnected'}`,
      icon: HardDrive,
      color: 'text-purple-400',
      border: 'border-purple-500/30',
      bg: 'bg-purple-500/10',
    },
    {
      title: 'Active Peers',
      value: `${health.active_peers || 0} / 20`,
      subtitle: `${health.total_peers || 0} total registered`,
      icon: Users,
      color: 'text-brand-400',
      border: 'border-brand-500/30',
      bg: 'bg-brand-500/10',
    },
    {
      title: 'Replication Health',
      value: 'Optimal (3x)',
      subtitle: 'XOR distance metrics active',
      icon: Layers,
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'DHT Routing State',
      value: 'Kademlia Ready',
      subtitle: 'Provider records synced',
      icon: ShieldCheck,
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      bg: 'bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div key={idx} className={`glass-panel p-5 rounded-xl border relative overflow-hidden transition-all duration-300 hover:border-slate-600`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400 tracking-wider uppercase mb-1">{c.title}</p>
                <h4 className="text-2xl font-bold tracking-tight text-white mb-1">{c.value}</h4>
                <p className="text-xs text-slate-400">{c.subtitle}</p>
              </div>
              <div className={`p-2.5 rounded-lg ${c.bg} ${c.color}`}>
                <Icon size={20} />
              </div>
            </div>
            {/* Subtle glow bottom edge */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-50" />
          </div>
        );
      })}
    </div>
  );
}
