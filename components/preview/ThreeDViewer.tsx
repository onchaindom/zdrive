'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Environment, Center, useGLTF } from '@react-three/drei';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { ipfsToHttp } from '@/lib/constants';

interface ThreeDViewerProps {
  uri: string;
  fileType: 'glb' | 'gltf' | 'stl';
  className?: string;
}

// GLB/GLTF Model component
function GLTFModel({ url }: { url: string }) {
  const { scene } = useGLTF(url);

  return (
    <Center>
      <primitive object={scene} />
    </Center>
  );
}

// STL Model component
function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  const processedGeometry = useMemo(() => {
    const geom = geometry.clone();
    // Center and scale the geometry once to avoid cumulative scaling.
    geom.center();
    geom.computeBoundingBox();
    geom.computeVertexNormals();

    const boundingBox = geom.boundingBox;
    if (boundingBox) {
      const size = new THREE.Vector3();
      boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) {
        const scale = 2 / maxDim;
        geom.scale(scale, scale, scale);
      }
    }

    return geom;
  }, [geometry]);

  useEffect(() => {
    return () => {
      processedGeometry.dispose();
    };
  }, [processedGeometry]);

  return (
    <mesh geometry={processedGeometry}>
      <meshStandardMaterial
        color="#a0a0a0"
        metalness={0.1}
        roughness={0.5}
        side={THREE.DoubleSide}
        flatShading
      />
    </mesh>
  );
}

// Loading fallback
function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#e5e5e5" wireframe />
    </mesh>
  );
}

export function ThreeDViewer({ uri, fileType, className }: ThreeDViewerProps) {
  const httpUrl = ipfsToHttp(uri);

  return (
    <div className={`relative aspect-square bg-zdrive-bg ${className}`}>
      <Canvas
        camera={{ position: [3, 3, 3], fov: 50 }}
        style={{ background: '#fafafa' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <directionalLight position={[-10, -10, -5]} intensity={0.3} />

        <Suspense fallback={<LoadingFallback />}>
          {fileType === 'stl' ? (
            <STLModel url={httpUrl} />
          ) : (
            <GLTFModel url={httpUrl} />
          )}
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          autoRotate={false}
          minDistance={1}
          maxDistance={20}
        />

        <Environment preset="studio" />
      </Canvas>

      {/* Controls hint */}
      <div className="absolute bottom-2 left-2 text-xs text-zdrive-text-muted">
        Drag to rotate · Scroll to zoom
      </div>
    </div>
  );
}
