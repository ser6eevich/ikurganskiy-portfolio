import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Featured.module.css';

const Featured = () => {
    const navigate = useNavigate();
    const scrollRef = useRef(null);
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                // Take first 6 projects
                setProjects(data.slice(0, 6));
            })
            .catch(err => console.error('Error fetching featured projects:', err));
    }, []);

    const scroll = (direction) => {
        if (scrollRef.current) {
            const { current } = scrollRef;
            // On mobile, card is 85vw + 2rem gap. On desktop 45vw + 2rem.
            // We need to scroll enough to snap to next slide.
            const isMobile = window.innerWidth <= 768;
            const scrollUnit = isMobile
                ? window.innerWidth * 0.85 + 32 // ~Card width + gap
                : window.innerWidth * 0.45 + 32;

            const scrollAmount = direction === 'left' ? -scrollUnit : scrollUnit;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Helper to get year
    const getYear = (dateString) => new Date(dateString).getFullYear();

    return (
        <section id="projects" className={styles.featuredSection}>

            <div className={styles.header}>
                <h2 className={styles.title}>[ ИЗБРАННЫЕ КЕЙСЫ ]</h2>
                <div className={styles.controls}>
                    <button onClick={() => scroll('left')} className={styles.navBtn}>←</button>
                    <button onClick={() => scroll('right')} className={styles.navBtn}>→</button>
                </div>
            </div>

            <div className={styles.scrollContainer} ref={scrollRef}>
                {projects.map((project) => (
                    <div key={project.id} className={styles.card} onClick={() => navigate(`/project/${project.id}`)} style={{ cursor: 'pointer' }}>
                        <div className={styles.mediaWrapper}>
                            {/* Check if thumbnail exists, otherwise placeholder */}
                            {project.thumbnail ? (
                                <img
                                    src={project.thumbnail}
                                    alt={project.title}
                                    className={styles.image}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#222', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontFamily: 'monospace' }}>
                                    NO PREVIEW
                                </div>
                            )}
                            <div className={styles.overlay}>
                                <button className={styles.watchBtn}>СМОТРЕТЬ КЕЙС</button>
                            </div>
                        </div>

                        <div className={styles.info}>
                            <div className={styles.meta}>
                                <span>{project.category || 'PROJECT'}</span>
                                <span>[{getYear(project.createdAt)}]</span>
                            </div>
                            <h3 className={styles.projectTitle}>{project.title}</h3>
                            <div className={styles.role}>FULL CASE STUDY</div>
                        </div>
                    </div>
                ))}

                {projects.length === 0 && <div className={styles.loading}>Loading Projects...</div>}

                {/* Padding card or spacer to ensure last item is visible/centerable */}
                <div className={styles.spacer}></div>
            </div>

        </section>
    );
};

export default Featured;
