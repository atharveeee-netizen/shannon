import React from 'react';
import { StaticAnalysisIssue } from '../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Lightbulb, Wrench, ShieldCheck } from 'lucide-react';

interface GhostAuditorProps {
  issues: StaticAnalysisIssue[];
  onSelectNode: (nodeId: string) => void;
  onAutoFix: (issueId: string) => void;
}

export const GhostAuditor: React.FC<GhostAuditorProps> = ({
  issues,
  onSelectNode,
  onAutoFix,
}) => {
  const errorCount = issues.filter((i) => i.severity === 'error').length;
  const warningCount = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div className="w-full h-[580px] bg-slate-950/80 rounded-xl border border-slate-800 backdrop-blur-md p-4 flex flex-col gap-3 overflow-hidden shadow-2xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-slate-200 uppercase tracking-wider font-mono">
            GHOST COMPILER (STATIC SAFETY & MEMORY AUDITOR)
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {errorCount > 0 ? (
            <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
              {errorCount} ERRORS
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 0 ERRORS (MISRA-C COMPLIANT)
            </span>
          )}
          {warningCount > 0 && (
            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
              {warningCount} WARNINGS
            </span>
          )}
        </div>
      </div>

      {/* Issues List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
        {issues.map((issue) => {
          let icon = <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />;
          let cardBg = 'bg-slate-900/60 border-slate-800';

          if (issue.severity === 'error') {
            icon = <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />;
            cardBg = 'bg-rose-950/20 border-rose-800/40';
          } else if (issue.severity === 'warning') {
            icon = <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
            cardBg = 'bg-amber-950/20 border-amber-800/40';
          }

          return (
            <div key={issue.id} className={`p-3.5 rounded-lg border flex flex-col gap-1.5 transition ${cardBg}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {icon}
                  <h4 className="text-xs font-semibold text-slate-200 font-mono">{issue.title}</h4>
                </div>

                {issue.nodeId && (
                  <button
                    onClick={() => onSelectNode(issue.nodeId!)}
                    className="text-[10px] font-mono text-cyan-400 hover:underline shrink-0"
                  >
                    Locate Layer &rarr;
                  </button>
                )}
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed pl-6">{issue.description}</p>

              {issue.fixSuggestion && (
                <div className="ml-6 mt-1.5 p-2 bg-slate-950/80 rounded border border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-amber-300">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{issue.fixSuggestion}</span>
                  </div>

                  <button
                    onClick={() => onAutoFix(issue.id)}
                    className="px-2.5 py-1 text-[10px] font-medium bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/30 rounded flex items-center gap-1 shrink-0 transition"
                  >
                    <Wrench className="w-3 h-3" /> Auto-Fix
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};