import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useSTL, Center } from '@react-three/drei';
import { Suspense } from 'react';

/**
 * STLViewer provides a professional-grade 3D inspection environment.
 * It features auto-centering, studio lighting, and smooth orbit controls.
 */
export function STLViewer({ url }: { url: string }) {
    return (
        <div style={{ width: '100%', height: '400px', background: '#f8fafc', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', position: 'relative' }}>
            <Suspense fallback={
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontWeight: 600 }}>
                    Initializing 3D Model...
                </div>
            }>
                <Canvas shadows camera={{ position: [0, 0, 10], fov: 50 }}>
                    <Stage environment="city" intensity={0.6} contactShadow={{ opacity: 0.7, blur: 2 }}>
                        <Center>
                            <Model url={url} />
                        </Center>
                    </Stage>
                    <OrbitControls makeDefault />
                </Canvas>
            </Suspense>
        </div>
    );
}

function Model({ url }: { url: string }) {
    const geometry = useSTL(url);
    return (
        <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial color="#64748b" roughness={0.3} metalness={0.8} />
        </mesh>
    );
}
