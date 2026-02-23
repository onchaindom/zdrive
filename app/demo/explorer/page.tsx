'use client';

import { useState } from 'react';
import { DemoFeed } from './DemoFeed';
import { DemoRelease } from './DemoRelease';
import { DemoCreator } from './DemoCreator';

const DEMOS = [
  { id: 'feed', label: 'Feed / Explore', component: DemoFeed },
  { id: 'release', label: 'Release', component: DemoRelease },
  { id: 'creator', label: 'Creator', component: DemoCreator },
] as const;

export default function ExplorerDemoPage() {
  const [activeDemo, setActiveDemo] = useState<string>('feed');
  const ActiveComponent = DEMOS.find((d) => d.id === activeDemo)?.component ?? DemoFeed;

  return (
    <div className="min-h-screen" style={{ background: '#E8E8E8' }}>
      {/* Demo selector bar */}
      <div className="fixed top-0 left-0 right-0 z-50 font-mono" style={{ background: '#1E1E1E', borderBottom: '1px solid #333' }}>
        <div className="flex items-center h-10 px-4 gap-6">
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#666' }}>DEMO</span>
          <div className="flex items-center gap-1">
            {DEMOS.map((demo) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(demo.id)}
                className={`px-3 py-1 text-xs tracking-wider transition-colors ${
                  activeDemo === demo.id
                    ? 'font-bold'
                    : ''
                }`}
                style={{
                  background: activeDemo === demo.id ? '#E8E8E8' : 'transparent',
                  color: activeDemo === demo.id ? '#1E1E1E' : '#888',
                }}
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
