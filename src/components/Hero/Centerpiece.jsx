import React, { useRef } from 'react';
import { useGLTF, Center, Float } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const PlayButton = () => {
    return (
        <group position={[0.8, 0.5, 0.5]} rotation={[0, -0.2, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.1, 32]} />
                <meshStandardMaterial color="#ccff00" metalness={0.5} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0, 0.06]} rotation={[0, 0, -Math.PI / 2]}>
                <coneGeometry args={[0.15, 0.25, 3]} />
                <meshStandardMaterial color="#000000" />
            </mesh>
        </group>
    );
};

const Centerpiece = ({ scale = 2 }) => {
    const { scene } = useGLTF('/models/me.glb');
    const groupRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;
        // Gentle rotation based on mouse
        const { pointer } = state;
        groupRef.current.rotation.y = pointer.x * 0.1;
    });

    return (
        <Center position={[0, -1, 0]}> {/* Moved down slightly to fit full body */}
            <group ref={groupRef}>
                <primitive
                    object={scene}
                    scale={scale}
                    rotation={[0, 0, 0]}
                />
                {/* Floating Play Button "in hand" or nearby */}
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <PlayButton />
                </Float>
            </group>
        </Center>
    );
};

useGLTF.preload('/models/me.glb');

export default Centerpiece;
