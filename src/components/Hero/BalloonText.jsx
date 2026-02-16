import React, { useRef, useMemo } from 'react';
import { Text3D, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const fontUrl = 'https://threejs.org/examples/fonts/optimer_bold.typeface.json';

const BalloonText = ({ theme }) => {
    const isDark = theme === 'dark';

    // Target Color Logic:
    // Light Mode -> Black (#111111)
    // Dark Mode -> Greyish (#888888) instead of White, as requested
    const targetColor = useMemo(() => {
        return new THREE.Color(isDark ? '#888888' : '#111111');
    }, [isDark]);

    const groupRef = useRef();
    const materialRef = useRef();

    useFrame((state) => {
        if (!groupRef.current) return;

        // 1. Cursor Following (Rotation)
        const { pointer } = state;
        const targetRotationX = -pointer.y * 0.2;
        const targetRotationY = pointer.x * 0.2;

        groupRef.current.rotation.x = THREE.MathUtils.lerp(
            groupRef.current.rotation.x,
            targetRotationX,
            0.1
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
            groupRef.current.rotation.y,
            targetRotationY,
            0.1
        );

        // 2. Smooth Color Transition
        if (materialRef.current) {
            // Linearly interpolate current color to target color
            materialRef.current.color.lerp(targetColor, 0.05);
        }
    });

    return (
        <group ref={groupRef}>
            <Center position={[0, 0, 0]}>
                <Text3D
                    font={fontUrl}
                    size={4.5}
                    height={0.1}
                    curveSegments={32}
                    bevelEnabled
                    bevelThickness={0.3}
                    bevelSize={0.1}
                    bevelOffset={0}
                    bevelSegments={8}
                >
                    IK
                    <meshPhysicalMaterial
                        ref={materialRef}
                        metalness={0.1}
                        roughness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        reflectivity={0.5}
                        color={isDark ? '#333333' : '#111111'} // Initial value, updated by useFrame
                    />
                </Text3D>
            </Center>
        </group>
    );
};

export default BalloonText;
