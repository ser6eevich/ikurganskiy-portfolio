import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

// Helper for loading models
const ToolModel = ({ path, scale, position, rotation }) => {
    const { scene } = useGLTF(path);
    const clone = scene.clone();

    return (
        <primitive
            object={clone}
            scale={scale}
            position={position}
            rotation={rotation}
        />
    );
};

const FloatingTools = () => {
    const groupRef = useRef();

    // Rotate the entire group of tools around the center
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.2; // Slow rotation speed
        }
    });

    // visually normalized scales
    // Radius for the orbit
    const R = 3.5;
    const Y_HEIGHT = -0.5; // Roughly waist/knee height or floating mid-air

    return (
        <group ref={groupRef}>
            {/* 
        Arranging items in a circle (6 items -> 60 degrees apart) 
        Positions calculated roughly as [R * sin(angle), Y, R * cos(angle)]
      */}

            {/* 1. Keyboard (Front Right) */}
            <ToolModel
                path="/models/keyboard.glb"
                scale={0.03}
                position={[R * 0.866, Y_HEIGHT, R * 0.5]}
                rotation={[0.5, -0.5, 0]}
            />

            {/* 2. Mouse (Right) */}
            <ToolModel
                path="/models/mouse.glb"
                scale={0.06}
                position={[R * 0.0, Y_HEIGHT, R * 1.0]}
                rotation={[0, 0, 0]}
            />

            {/* 3. Headphones (Back Right) */}
            <ToolModel
                path="/models/headphone.glb"
                scale={0.012}
                position={[-R * 0.866, Y_HEIGHT + 1, R * 0.5]} // Floating a bit higher
                rotation={[0, Math.PI / 2, 0]}
            />

            {/* 4. AE Icon (Back Left) */}
            <ToolModel
                path="/models/after effects icon.glb"
                scale={0.8}
                position={[-R * 0.866, Y_HEIGHT + 2, -R * 0.5]}
                rotation={[0, 0, 0]}
            />

            {/* 5. Premiere Icon (Left) */}
            <ToolModel
                path="/models/premiere pro icon.glb"
                scale={0.8}
                position={[0, Y_HEIGHT + 1.5, -R]}
                rotation={[0, 0, 0]}
            />

            {/* 6. Blender Icon (Front Left) */}
            <ToolModel
                path="/models/blender icon.glb"
                scale={0.8}
                position={[R * 0.866, Y_HEIGHT + 0.5, -R * 0.5]}
                rotation={[0, -0.5, 0]}
            />
        </group>
    );
};

export default FloatingTools;
