
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './CoverflowCarousel.module.css';

const GAP = 100; // Overlap/Gap between cards
const VISIBLE_ITEMS = 3; // How many items to show on each side

const CoverflowCarousel = ({ items, onSelect }) => {
    const [activeIndex, setActiveIndex] = useState(items.length * 100);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 260, height: 460 });

    useEffect(() => {
        const handleResize = () => {
            const isMobile = window.innerWidth <= 768;
            setDimensions({
                width: isMobile ? 180 : 260,
                height: isMobile ? 320 : 460
            });
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const { width: CARD_WIDTH, height: CARD_HEIGHT } = dimensions;

    // No need to reset activeIndex on items change if we use modulo, 
    // but good to keep it stable.

    const handleNext = () => {
        setActiveIndex((prev) => prev + 1);
    };

    const handlePrev = () => {
        setActiveIndex((prev) => prev - 1);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'ArrowRight') handleNext();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Wheel Navigation
    const handleWheel = (e) => {
        if (Math.abs(e.deltaX) > 20 || Math.abs(e.deltaY) > 20) {
            if (e.deltaY > 0 || e.deltaX > 0) {
                handleNext();
            } else {
                handlePrev();
            }
        }
    };

    return (
        <div
            className={styles.container}
            ref={containerRef}
            onWheel={handleWheel}
        >
            <motion.div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transformStyle: 'preserve-3d',
                    cursor: 'grab'
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                    const swipe = offset.x; // Negative is left (next), Positive is right (prev)
                    if (swipe < -40) {
                        handleNext();
                    } else if (swipe > 40) {
                        handlePrev();
                    }
                }}
            >
                {/* Render a window of items around the active index */}
                {Array.from({ length: VISIBLE_ITEMS * 2 + 1 }).map((_, i) => {
                    const offset = i - VISIBLE_ITEMS;
                    const index = activeIndex + offset;
                    const itemIndex = ((index % items.length) + items.length) % items.length;
                    const item = items[itemIndex];

                    return (
                        <CarouselItem
                            key={index}
                            item={item}
                            offset={offset}
                            isActive={offset === 0}
                            dimensions={dimensions}
                            onSelect={() => onSelect(item)}
                            onActivate={() => setActiveIndex(index)}
                        />
                    );
                })}
            </motion.div>

            {/* Navigation Controls - Improved Visibility */}
            <ArrowButton direction="left" onClick={handlePrev} />
            <ArrowButton direction="right" onClick={handleNext} />
        </div>
    );
};

// --- Sub-component to handle hooks and lazy loading properly ---
const CarouselItem = ({ item, offset, isActive, dimensions, onSelect, onActivate }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);
    const { width: CARD_WIDTH, height: CARD_HEIGHT } = dimensions;

    // 3D Transform Logic
    const x = offset * (GAP * 0.8);
    const scale = isActive ? 1.2 : 1 - Math.abs(offset) * 0.15;
    const rotateY = offset > 0 ? -35 : offset < 0 ? 35 : 0;
    const z = isActive ? 200 : -Math.abs(offset) * 150;
    const opacity = isActive ? 1 : Math.max(0.3, 0.8 - Math.abs(offset) * 0.2);
    const blur = isActive ? 0 : Math.abs(offset) * 3;

    return (
        <motion.div
            onClick={(e) => {
                e.stopPropagation();
                if (isActive) {
                    onSelect();
                } else {
                    onActivate();
                }
            }}
            initial={false}
            animate={{
                x: x,
                z: z,
                rotateY: rotateY,
                scale: scale,
                opacity: opacity,
                filter: `blur(${blur}px)`
            }}
            transition={{
                type: "spring",
                stiffness: 180,
                damping: 24,
                mass: 1
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'absolute',
                width: CARD_WIDTH,
                height: CARD_HEIGHT,
                borderRadius: '20px',
                overflow: 'visible',
                cursor: 'pointer',
                background: '#000',
                border: isActive ? '3px solid #ccff00' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: isActive ? '0 0 50px rgba(204, 255, 0, 0.5)' : '0 10px 40px rgba(0,0,0,0.5)',
                zIndex: 1000 - Math.abs(offset)
            }}
        >
            {/* Lazy load: only render video if active or hovered */}
            {(isActive || isHovered) ? (
                <video
                    ref={videoRef}
                    src={item.startsWith('http') ? item : `/uploads/${item}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        pointerEvents: 'auto'
                    }}
                    muted
                    loop
                    playsInline
                    autoPlay
                />
            ) : (
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        background: '#111',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#333'
                    }}
                >
                    <span style={{ fontSize: '2rem' }}>🎬</span>
                </div>
            )}
        </motion.div>
    );
};

const ArrowButton = ({ direction, onClick }) => (
    <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        style={{
            position: 'absolute',
            [direction === 'left' ? 'left' : 'right']: '20px',
            zIndex: 2000,
            background: 'rgba(0,0,0,0.5)', // Darker background for contrast on white
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '56px',
            height: '56px',
            color: 'white',
            cursor: 'pointer',
            fontSize: '1.8rem',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onMouseEnter={(e) => {
            e.currentTarget.style.background = '#ccff00';
            e.currentTarget.style.color = 'black';
            e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0,0,0,0.5)';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'scale(1)';
        }}
    >
        {direction === 'left' ? '←' : '→'}
    </button>
);

export default CoverflowCarousel;
