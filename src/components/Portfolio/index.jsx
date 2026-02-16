import React, { useState, useEffect, useRef } from 'react';
import styles from './Portfolio.module.css';
import SmartVideoPlayer from '../SmartVideoPlayer';

const filters = ['ВСЕ', 'REELS', 'YOUTUBE', 'TV-SHOWS', 'VFX'];

const Portfolio = () => {
    const [activeFilter, setActiveFilter] = useState('ВСЕ');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/archive')
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    // --- Video Modal State ---
    const [selectedProject, setSelectedProject] = useState(null);

    const filteredProjects = activeFilter === 'ВСЕ'
        ? projects
        : projects.filter(p => p.category === activeFilter);

    const getYoutubeId = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    if (loading) return <div style={{ padding: '4rem', color: '#fff' }}>Loading Works...</div>;

    return (
        <section id="works" className={styles.portfolioSection}>

            {/* Video Modal */}
            {selectedProject && (selectedProject.type === 'video' || selectedProject.type === 'youtube') && (
                <SmartVideoPlayer
                    src={selectedProject.fileUrl}
                    title={selectedProject.title}
                    description={selectedProject.description}
                    type={selectedProject.type}
                    thumbnail={selectedProject.thumbnail}
                    onClose={() => setSelectedProject(null)}
                />
            )}

            {/* Image Modal */}
            {selectedProject && selectedProject.type !== 'video' && selectedProject.type !== 'youtube' && (
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 2000, backdropFilter: 'blur(10px)'
                    }}
                    onClick={() => setSelectedProject(null)}
                >
                    <img
                        src={selectedProject.fileUrl}
                        alt={selectedProject.title}
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }}
                    />
                    <button
                        onClick={() => setSelectedProject(null)}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'transparent',
                            border: '1px solid white',
                            color: 'white',
                            width: '40px', height: '40px',
                            borderRadius: '50%',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Header & Filters */}
            <div className={styles.header}>
                <h2 className={styles.title}>[ АРХИВ ПРОЕКТОВ ]</h2>

                <div className={styles.filters}>
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            [{filter}]
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className={styles.grid}>
                {filteredProjects.length === 0 && (
                    <div style={{ color: '#666', gridColumn: '1/-1', padding: '2rem 0' }}>No works found in this category.</div>
                )}

                {filteredProjects.map(project => {
                    const isVertical = project.orientation === 'vertical' ||
                        (!project.orientation && project.type === 'video' && project.category === 'REELS');

                    const youtubeId = project.type === 'youtube' ? getYoutubeId(project.fileUrl) : null;

                    // Fix: If it's a video and has no thumbnail, don't use fileUrl as img src
                    let thumbnailUrl = project.thumbnail;
                    if (!thumbnailUrl && youtubeId) {
                        thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
                    }

                    return (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            isVertical={isVertical}
                            thumbnailUrl={thumbnailUrl}
                            onClick={() => setSelectedProject(project)}
                        />
                    );
                })}
            </div>

        </section>
    );
};

// --- Optimized Project Card Component ---
const ProjectCard = ({ project, isVertical, thumbnailUrl, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef(null);

    return (
        <div
            className={`${styles.card} ${styles[isVertical ? 'tall' : 'wide']}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={styles.mediaContainer}>
                {project.type === 'video' ? (
                    <>
                        {thumbnailUrl ? (
                            <img
                                src={thumbnailUrl}
                                alt={project.title}
                                className={styles.poster}
                                style={{
                                    opacity: isHovered ? 0 : 1,
                                    transition: 'opacity 0.3s ease',
                                    position: 'absolute',
                                    top: 0, left: 0, width: '100%', height: '100%',
                                    objectFit: 'cover',
                                    zIndex: 1
                                }}
                            />
                        ) : (
                            <div
                                className={styles.poster}
                                style={{
                                    background: '#222',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    opacity: isHovered ? 0 : 1,
                                }}
                            >
                                <span style={{ color: '#444', fontSize: '2rem' }}>🎬</span>
                            </div>
                        )}
                        {isHovered && (
                            <video
                                ref={videoRef}
                                src={project.fileUrl}
                                className={styles.poster}
                                muted
                                loop
                                playsInline
                                autoPlay
                                style={{ zIndex: 2 }}
                                onLoadedData={() => {
                                    if (videoRef.current) {
                                        videoRef.current.play().catch(() => { });
                                    }
                                }}
                            />
                        )}
                    </>
                ) : (
                    thumbnailUrl ? (
                        <img src={thumbnailUrl} alt={project.title} className={styles.poster} />
                    ) : (
                        <div className={styles.poster} style={{ background: '#222' }} />
                    )
                )}
            </div>

            <div className={styles.cardInfo}>
                <div className={styles.cardHeader}>
                    <span className={styles.year}>[{new Date(project.createdAt).getFullYear()}]</span>
                    <span className={styles.category}>{project.category}</span>
                </div>
                <h3 className={styles.cardTitle}>{project.title}</h3>
            </div>

            <div className={styles.playIcon}>▶</div>
        </div>
    );
};

export default Portfolio;
