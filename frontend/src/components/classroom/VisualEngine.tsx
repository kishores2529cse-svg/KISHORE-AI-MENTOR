import React, { useState } from 'react';
import { Zap, Activity, Sliders, RefreshCw, Lightbulb, BookOpen, Network, Database, Code, Cpu } from 'lucide-react';
import katex from 'katex';

interface VisualEngineProps {
  visualSpec: Record<string, any>;
  concept: string;
  bulletPoints: string[];
  analogy?: string;
  practicalExample?: string;
}

export const VisualEngine: React.FC<VisualEngineProps> = ({
  visualSpec,
  concept,
  bulletPoints,
  analogy,
  practicalExample
}) => {
  // Circuit simulation state (only used when topic is explicitly circuits)
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(6);
  const current = (voltage / Math.max(1, resistance)).toFixed(2);

  // Helper to render KaTeX formula safely
  const renderFormula = (latex: string) => {
    try {
      return { __html: katex.renderToString(latex, { throwOnError: false }) };
    } catch {
      return { __html: latex };
    }
  };

  const loweredConcept = concept.toLowerCase();
  const visualType = visualSpec?.type || 'diagram';

  // Determine specific visual canvas
  const isCircuitTopic = visualType === 'circuit' || 
    (loweredConcept.includes('circuit') && (loweredConcept.includes('ohm') || loweredConcept.includes('resistor') || loweredConcept.includes('voltage')));

  const isNetworkTopic = visualType === 'network' || visualType === 'flowchart' || 
    loweredConcept.includes('network') || loweredConcept.includes('tcp') || loweredConcept.includes('protocol') || loweredConcept.includes('handshake');

  const isDbmsTopic = visualType === 'database' || loweredConcept.includes('database') || 
    loweredConcept.includes('dbms') || loweredConcept.includes('normalization') || loweredConcept.includes('sql');

  const isCodeTopic = visualType === 'code' || loweredConcept.includes('recursion') || 
    loweredConcept.includes('function') || loweredConcept.includes('algorithm') || loweredConcept.includes('python');

  return (
    <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 flex flex-col justify-between h-full space-y-5">
      
      {/* Visual Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            {isNetworkTopic ? (
              <Network className="w-4 h-4 text-cyan-400" />
            ) : isDbmsTopic ? (
              <Database className="w-4 h-4 text-amber-400" />
            ) : isCodeTopic ? (
              <Code className="w-4 h-4 text-emerald-400" />
            ) : isCircuitTopic ? (
              <Zap className="w-4 h-4 text-cyan-400" />
            ) : (
              <Activity className="w-4 h-4 text-indigo-400" />
            )}
          </div>
          <div>
            <h3 className="text-xs uppercase font-extrabold text-cyan-400 tracking-wider">
              {visualSpec?.category || "Dynamic Visual Blueprint"}
            </h3>
            <h2 className="text-sm sm:text-base font-bold text-white">
              {visualSpec?.title || concept}
            </h2>
          </div>
        </div>

        <span className="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2.5 py-1 rounded-full border border-slate-700">
          {visualType.toUpperCase()}
        </span>
      </div>

      {/* Main Visual Canvas Area */}
      <div className="bg-slate-950/80 rounded-xl border border-slate-800 p-4 sm:p-5 relative overflow-hidden min-h-[220px] flex items-center justify-center">
        
        {/* 1. NETWORKS / PROTOCOLS VISUAL */}
        {isNetworkTopic ? (
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-cyan-400">Client (Host A)</span>
              <span className="text-slate-500 font-mono text-[10px]">TCP Handshake</span>
              <span className="font-bold text-indigo-400">Server (Host B)</span>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/30">
                <span>1. SYN (seq = x)</span>
                <span className="text-slate-400">➔ Request Connection</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-amber-300 bg-amber-950/30 p-2 rounded-lg border border-amber-800/30">
                <span>2. SYN-ACK (seq = y, ack = x+1)</span>
                <span className="text-slate-400">⬅ Confirm & Synchronize</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-emerald-300 bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/30">
                <span>3. ACK (ack = y+1)</span>
                <span className="text-slate-400">➔ Connection Established</span>
              </div>
            </div>
          </div>
        ) : isDbmsTopic ? (
          /* 2. DATABASE / NORMALIZATION VISUAL */
          <div className="w-full space-y-3">
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
                <span className="font-bold text-indigo-300 block text-[11px]">1NF</span>
                <span className="text-[10px] text-slate-400">Atomic Values</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-800/40">
                <span className="font-bold text-cyan-300 block text-[11px]">2NF</span>
                <span className="text-[10px] text-slate-400">No Partial Dep.</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40">
                <span className="font-bold text-emerald-300 block text-[11px]">3NF</span>
                <span className="text-[10px] text-slate-400">No Transitive Dep.</span>
              </div>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-center text-xs text-slate-300">
              <span className="font-mono text-cyan-300">Primary Key (A, B) ➔ Non-Key (C)</span>
              <p className="text-[10px] text-slate-400 mt-1">Every non-prime attribute must depend directly on the whole primary key.</p>
            </div>
          </div>
        ) : isCodeTopic ? (
          /* 3. PROGRAMMING / RECURSION VISUAL */
          <div className="w-full space-y-2">
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              <div className="text-indigo-400">def recursive_function(n):</div>
              <div className="pl-4 text-amber-300">if n &lt;= 1: return 1  <span className="text-slate-500"># Base Case</span></div>
              <div className="pl-4 text-emerald-400">return n * recursive_function(n - 1) <span className="text-slate-500"># Call Stack</span></div>
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-2">
              <span>Stack Frame Growth ➔</span>
              <span className="text-emerald-400 font-bold">Unwinding to Base Case</span>
            </div>
          </div>
        ) : isCircuitTopic ? (
          /* 4. ELECTRIC CIRCUIT VISUAL (ONLY when explicitly studying circuits) */
          <div className="w-full space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center">
                <span className="text-[11px] font-bold text-indigo-300 uppercase mb-2">⚡ Circuit Model</span>
                <svg viewBox="0 0 200 120" className="w-full max-w-[200px] h-24">
                  <rect x="20" y="45" width="20" height="30" rx="4" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                  <text x="25" y="64" fill="#38bdf8" fontSize="10" fontWeight="bold">{voltage}V</text>
                  <path d="M 30 45 L 30 20 L 170 20 L 170 45" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 30 75 L 30 100 L 170 100 L 170 75" fill="none" stroke="#64748b" strokeWidth="3" />
                  <path d="M 170 45 L 160 50 L 180 55 L 160 60 L 180 65 L 170 75" fill="none" stroke="#f59e0b" strokeWidth="3" />
                  <text x="135" y="64" fill="#f59e0b" fontSize="10" fontWeight="bold">{resistance}Ω</text>
                  <circle cx="100" cy="20" r="4" fill="#38bdf8" className="animate-ping opacity-80" />
                  <text x="75" y="15" fill="#38bdf8" fontSize="9" fontWeight="bold">I = {current} A</text>
                </svg>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col items-center justify-between">
                <span className="text-[11px] font-bold text-amber-300 uppercase mb-2">🚰 Controls</span>
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Voltage: {voltage}V</span>
                    <input type="range" min="2" max="24" step="2" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className="w-24 accent-cyan-400" />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Resistance: {resistance}Ω</span>
                    <input type="range" min="1" max="20" step="1" value={resistance} onChange={(e) => setResistance(Number(e.target.value))} className="w-24 accent-amber-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 5. GENERAL CONCEPTUAL / EQUATION CANVAS */
          <div className="p-4 text-center space-y-3 w-full">
            {visualSpec?.formula_latex ? (
              <div
                className="text-base sm:text-lg font-bold text-cyan-300 overflow-x-auto py-2"
                dangerouslySetInnerHTML={renderFormula(visualSpec.formula_latex)}
              />
            ) : (
              <div className="flex items-center justify-center gap-3 p-4 bg-slate-900/60 rounded-xl border border-slate-800">
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
                <span className="text-sm font-semibold text-slate-200">{concept}</span>
              </div>
            )}
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {visualSpec?.key_takeaway || 'Variables interact dynamically to form the core foundation of this concept.'}
            </p>
          </div>
        )}

      </div>

      {/* Conceptual Cards: Takeaways, Analogy, Practical Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {analogy && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-1">
              <Lightbulb className="w-3 h-3" />
              Intuitive Analogy
            </div>
            <p className="text-slate-300 leading-relaxed">{analogy}</p>
          </div>
        )}

        {practicalExample && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300 uppercase tracking-wider text-[10px] mb-1">
              <BookOpen className="w-3 h-3" />
              Real-World Application
            </div>
            <p className="text-slate-300 leading-relaxed">{practicalExample}</p>
          </div>
        )}
      </div>

      {/* Bullet Points */}
      {bulletPoints && bulletPoints.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Key Principles:
          </h4>
          <ul className="space-y-1 text-xs text-slate-300">
            {bulletPoints.map((pt, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
};
