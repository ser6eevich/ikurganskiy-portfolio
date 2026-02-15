import React from 'react';
import Scene from './Scene';
import UI from './UI';
import styles from './Hero.module.css';

const Hero = ({ theme, toggleTheme, onOpenModal }) => {
    return (
        <div className={styles.container}>
            {/* 3D Scene Background (Desktop) */}
            <div className={styles.sceneContainer}>
                <Scene theme={theme} />
            </div>

            {/* Mobile Fallback Background */}
            <div className={styles.mobileBackground}>
                {/* Optional: Add an image here <img src="..." /> */}
            </div>

            {/* UI Overlay */}
            <UI onOpenModal={onOpenModal} />
        </div>
    );
};

export default Hero;
