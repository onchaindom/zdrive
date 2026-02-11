'use client';

import { Component, Suspense, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Center } from '@react-three/drei';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import * as THREE from 'three';
import { ipfsToHttp } from '@/lib/constants';

interface PointCloudViewerProps {
  uri: string;
  className?: string;
}

// PLY Model component using Three.js PLYLoader
function PLYModel({ url }: { url: string }) {
  const geometry = useLoader(PLYLoader, url);

  // Check if the geometry has vertex colors
  const hasColors = geometry.hasAttribute('color');

  return (
    <Center>
      <points>
        <bufferGeometry attach="geometry" {...geometry} />
        <pointsMaterial
          size={0.02}
          sizeAttenuation
          vertexColors={hasColors}
          color={hasColors ? undefined : '#888888'}
        />
      </points>
    </Center>
  );
}

// Loading fallback - spinning point cloud
function LoadingFallback() {
  const pointsRef = useRef<THREE.Points>(null);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.5;
    }
  });

  // Create a simple point cloud for loading state
  const positions = new Float32Array(100 * 3);
  for (let i = 0; i < 100; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 0.3;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#e5e5e5" />
    </points>
  );
}

// Error boundary to catch PLY load failures
interface ErrorBoundaryState {
  error: string | null;
}

class PLYErrorBoundary extends Component<
  { children: ReactNode; fallback: (error: string) => ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || 'Failed to load point cloud' };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

export function PointCloudViewer({ uri, className }: PointCloudViewerProps) {
  const httpUrl = ipfsToHttp(uri);

  const errorFallback = (
    <div className={`relative flex aspect-square items-center justify-center bg-zdrive-bg ${className}`}>
      <div className="text-center px-4">
        <p className="text-sm text-zdrive-text-muted">Unable to load point cloud</p>
        <a
          href={httpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-xs text-zdrive-text-secondary hover:underline"
        >
          Download PLY file &rarr;
        </a>
      </div>
    </div>
  );

  return (
    <PLYErrorBoundary fallback={() => errorFallback}>
      <div className={`relative aspect-square bg-zdrive-bg ${className}`}>
        <Canvas
          camera={{ position: [2, 2, 2], fov: 50 }}
          style={{ background: '#fafafa' }}
        >
          <ambientLight intensity={0.8} />
          <directionalLight position={[10, 10, 5]} intensity={0.5} />

          <Suspense fallback={<LoadingFallback />}>
            <PLYModel url={httpUrl} />
          </Suspense>

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            autoRotate={false}
            minDistance={0.5}
            maxDistance={20}
          />
        </Canvas>

        {/* Controls hint */}
        <div className="absolute bottom-2 left-2 text-xs text-zdrive-text-muted">
          Drag to rotate · Scroll to zoom
        </div>
      </div>
    </PLYErrorBoundary>
  );
}
