import React, { useEffect, useState, useRef } from 'react';
import styles from './SmartVideoPlayer.module.css';

const SmartVideoPlayer = ({ src, title, description, type, thumbnail, onClose }) => {
    const [layout, setLayout] = useState('horizontal'); // 'horizontal' | 'vertical'
    const [isClosing, setIsClosing] = useState(false); // New state
    const videoRef = useRef(null);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 400); // 400ms match CSS animation
    };

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const { videoWidth, videoHeight } = videoRef.current;
            // Determine layout based on aspect ratio
            if (videoHeight > videoWidth) {
                setLayout('vertical');
            } else {
                setLayout('horizontal');
            }
        }
    };

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (!src) return null;

    const isYoutube = type === 'youtube';
    const youtubeId = isYoutube ? getYoutubeId(src) : null;
    const backgroundUrl = thumbnail || (isYoutube ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg` : null);

    return (
        <div
            className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
            onClick={handleClose}
        >
            {/* Background Blur Layer */}
            {!backgroundUrl && !isYoutube && (
                <video
                    src={src}
                    className={styles.blurBackground}
                    autoPlay
                    muted
                    loop
                    playsInline
                />
            )}
            {backgroundUrl && (
                <div
                    className={styles.blurBackground}
                    style={{
                        backgroundImage: `url(${backgroundUrl})`,
                        backgroundSize: 'cover'
                    }}
                />
            )}

            {/* Main Content Layer */}
            <div
                className={`${styles.wrapper} ${styles[layout]} ${isClosing ? styles.closing : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`${styles.videoContainer} ${isYoutube ? styles.youtubeContainer : ''}`}>
                    {isYoutube ? (
                        <iframe
                            className={styles.mainVideo}
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`}
                            title={title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ width: '100%', height: '100%' }}
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={src}
                            className={styles.mainVideo}
                            controls
                            autoPlay
                            playsInline
                            onLoadedMetadata={handleLoadedMetadata}
                        />
                    )}
                </div>

                <div className={styles.infoPanel}>
                    {title && <h2 className={styles.title}>{title}</h2>}
                    {description && <p className={styles.description}>{description}</p>}
                </div>
            </div>

            <button
                className={styles.closeButton}
                onClick={(e) => { e.stopPropagation(); handleClose(); }}
            >
                ✕
            </button>
        </div>
    );
};

export default SmartVideoPlayer;
