'use client';

import { useState } from 'react';
import { DemoClassicExplorer } from './DemoClassicExplorer';
import { DemoTerminal } from './DemoTerminal';
import { DemoModernFM } from './DemoModernFM';
import { DemoFinder } from './DemoFinder';
import { DemoExplorerRefined } from './DemoIndex';

const DEMOS = [
  { id: 'classic', label: 'A: Classic Explorer', component: DemoClassicExplorer },
  { id: 'terminal', label: 'B: Terminal', component: DemoTerminal },
  { id: 'modern', label: 'C: Modern FM', component: DemoModernFM },
  { id: 'finder', label: 'D: Finder', component: DemoFinder },
  { id: 'refined', label: 'E: Refined', component: DemoExplorerRefined },
] as const;

export default function ExplorerDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>('finder');
  const ActiveComponent = DEMOS.find((d) => d.id === activeDemo)?.component ?? DemoFinder;

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Demo selector bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-neutral-900 text-white border-b border-neutral-700 font-mono">
        <div className="flex items-center h-10 px-4 gap-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">REDESIGN DEMO</span>
          <div className="flex items-center gap-1">
            {DEMOS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-3 py-1 text-xs tracking-wider transition-colors ${
                  activeDemo === demo.id
                    ? 'bg-white text-black font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {demo.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="pt-10">
        <ActiveComponent />
      </div>
    </div>
  );
}
