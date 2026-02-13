'use client';

export function Zorb({ size = 32, seed = '0x0000' }: { size?: number; seed?: string }) {
  const hash = seed.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 40) % 360;
  const h3 = (h1 + 180) % 360;
  const id = `zorb-${seed.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={id} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={`hsl(${h1}, 70%, 72%)`} />
          <stop offset="50%" stopColor={`hsl(${h2}, 60%, 58%)`} />
          <stop offset="100%" stopColor={`hsl(${h3}, 50%, 40%)`} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#${id})`} />
    </svg>
  );
}

export function ZorbWanderingLight({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id="z-wander" cx="30%" cy="30%" r="65%">
          <stop offset="0%" stopColor="hsl(35,75%,72%)">
            <animate attributeName="stop-color"
              values="hsl(35,75%,72%);hsl(95,75%,72%);hsl(155,75%,72%);hsl(215,75%,72%);hsl(275,75%,72%);hsl(335,75%,72%);hsl(35,75%,72%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
          <stop offset="55%" stopColor="hsl(350,60%,55%)">
            <animate attributeName="stop-color"
              values="hsl(350,60%,55%);hsl(50,60%,55%);hsl(110,60%,55%);hsl(170,60%,55%);hsl(230,60%,55%);hsl(290,60%,55%);hsl(350,60%,55%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stopColor="hsl(280,50%,35%)">
            <animate attributeName="stop-color"
              values="hsl(280,50%,35%);hsl(340,50%,35%);hsl(40,50%,35%);hsl(100,50%,35%);hsl(160,50%,35%);hsl(220,50%,35%);hsl(280,50%,35%)"
              dur="12s" repeatCount="indefinite" />
          </stop>
        </radialGradient>
      </defs>
      <g>
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 50 50;360 50 50"
          dur="2s"
          repeatCount="indefinite"
          calcMode="spline"
          keyTimes="0;1"
          keySplines="0.42 0 0.58 1"
        />
        <circle cx="50" cy="50" r="48" fill="url(#z-wander)" />
      </g>
    </svg>
  );
}
