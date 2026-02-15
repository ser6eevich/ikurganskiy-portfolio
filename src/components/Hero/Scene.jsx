import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, PerspectiveCamera, Loader } from '@react-three/drei';
import BalloonText from './BalloonText';

const Scene = ({ theme }) => {
    return (
        <>
            <Canvas
                dpr={[1, 2]}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={45} />

                {/* Lighting essential for glossy balloon look */}
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />

                <Suspense fallback={null}>
                    <BalloonText theme={theme} />
                    {/* 'warehouse' preset gives nice industrial reflections for the metal */}
                    <Environment preset="warehouse" />
                </Suspense>
            </Canvas>
            <Loader
                containerStyles={{ background: 'rgba(0,0,0,0.8)', zIndex: 1000 }}
                innerStyles={{ background: '#ccff00' }}
                barStyles={{ background: '#ccff00' }}
                dataStyles={{ color: 'white' }}
                dataInterpolation={(p) => `ЗАГРУЗКА ИНСТРУМЕНТОВ: ${p.toFixed(0)}%`}
            />
        </>
    );
};

export default Scene;
