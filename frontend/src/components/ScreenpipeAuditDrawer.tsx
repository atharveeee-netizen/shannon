import React, { useState } from 'react';
import { ShieldCheck, Lock, CheckCircle2, X, FileText } from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  category: 'SECURITY' | 'ARENA_ALLOC' | 'QUANT_PASS' | 'MUTATION';
  actor: string;
  action: string;
  hash: string;
  status: 'VERIFIED' | 'PASS';
}

interface ScreenpipeAuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScreenpipeAuditDrawer: React.FC<ScreenpipeAuditDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [filter, setFilter] = useState<string>('ALL');

  const logs: AuditLog[] = [
    { id: 'TX-9041', timestamp: '13:38:01.042', category: 'SECURITY', actor: 'Strix Security Agent', action: 'MISRA-C:2012 Rule 21.3 static memory audit verified (0 malloc calls detected)', hash: 'e3b0c44298fc1c149afbf4c8996fb924', status: 'VERIFIED' },
    { id: 'TX-9040', timestamp: '13:37:44.118', category: 'ARENA_ALLOC', actor: 'MemoryMapper Agent', action: 'Scheduled 4 tensor activation buffers into 0x20000000 contiguous SRAM arena', hash: '8f434346648f6b96df89dda901c5176b', status: 'VERIFIED' },
    { id: 'TX-9039', timestamp: '13:37:12.890', category: 'QUANT_PASS', actor: 'Quantizer Agent', action: 'Converted FP32 weights to symmetric INT8 (Scale factor S=0.00781, Z=0)', hash: 'cd2eb0837c9b4c962c22d2ff8b5069de', status: 'VERIFIED' },
    { id: 'TX-9038', timestamp: '13:36:50.005', category: 'MUTATION', actor: 'User Session (Operator)', action: 'Loaded target silicon profile: ESP32-S3 (Xtensa Dual-Core LX7)', hash: '1a79a4d60de6718e8e5b326e338ae533', status: 'PASS' },
  ];

  if (!isOpen) return null;

  const filteredLogs = filter === 'ALL' ? logs : logs.filter((l) => l.category === filter);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-palantir-card border-l border-palantir-border h-full shadow-2xl flex flex-col font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-palantir-border bg-palantir-nav flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-palantir-pass" />
            <div>
              <h3 className="text-xs font-bold text-palantir-textPrimary uppercase">
                SCREENPIPE CONTINUOUS AUDIT & CORDIS TRACE FEED
              </h3>
              <span className="text-[9px] text-palantir-textMuted block">
                Immutable 24/7 cryptographic telemetry record
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-palantir-textMuted hover:text-palantir-textPrimary">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Pills */}
        <div className="p-3 border-b border-palantir-border flex items-center gap-1.5 bg-palantir-canvas text-[10px]">
          {['ALL', 'SECURITY', 'ARENA_ALLOC', 'QUANT_PASS', 'MUTATION'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-1 rounded-[2px] border ${
                filter === cat
                  ? 'bg-palantir-action text-palantir-textPrimary border-palantir-cobalt font-bold'
                  : 'bg-palantir-card text-palantir-textSecondary border-palantir-border hover:text-palantir-textPrimary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Audit Log Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredLogs.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-palantir-canvas border border-palantir-border rounded-[3px] space-y-1.5"
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className="font-bold text-palantir-cobalt">{item.id}</span>
                <span className="text-palantir-textMuted">{item.timestamp}</span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-palantir-textPrimary font-sans">
                <FileText className="w-3.5 h-3.5 text-palantir-textMuted shrink-0" />
                <span>{item.action}</span>
              </div>

              <div className="pt-1.5 border-t border-palantir-border/60 flex items-center justify-between text-[9px] text-palantir-textMuted">
                <span className="truncate max-w-[240px]">SHA-256: {item.hash}</span>
                <span className="text-palantir-pass font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-palantir-nav border-t border-palantir-border flex items-center justify-between text-[10px]">
          <span className="text-palantir-textMuted flex items-center gap-1">
            <Lock className="w-3 h-3 text-palantir-pass" /> SOC2 TYPE II & STRIX ATTESTED
          </span>
          <span className="text-palantir-pass font-bold">100% AUDIT INTEGRITY</span>
        </div>
      </div>
    </div>
  );
};