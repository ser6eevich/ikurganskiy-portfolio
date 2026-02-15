import React from 'react';
import styles from './About.module.css';

const About = () => {
    return (
        <section id="about" className={styles.aboutSection}>

            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>[ ОБО МНЕ ]</h2>
            </div>

            <div className={styles.content}>

                {/* Left: Philosophy / Manifesto */}
                {/* Left: Philosophy / Manifesto */}
                <div className={styles.manifestoColumn}>
                    <h1 className={styles.manifestoText}>
                        МОНТАЖ — ЭТО НЕ ПРОСТО СКЛЕЙКА КАДРОВ. ЭТО УПРАВЛЕНИЕ ВНИМАНИЕМ, РИТМОМ И ЭМОЦИЕЙ ЗРИТЕЛЯ.
                    </h1>

                    <div className={styles.techSpecs}>
                        <div className={styles.techItem}>
                            <div className={styles.techValue}>15M+</div>
                            <div className={styles.techLabel}>ПРОСМОТРОВ</div>
                            <div className={styles.techSub}>REELS & SHORTS</div>
                        </div>
                        <div className={styles.techItem}>
                            <div className={styles.techValue}>20</div>
                            <div className={styles.techLabel}>ПРОЕКТОВ</div>
                            <div className={styles.techSub}>GLOBAL BRANDS</div>
                        </div>
                        <div className={styles.techItem}>
                            <div className={styles.techValue}>12H</div>
                            <div className={styles.techLabel}>СКОРОСТЬ</div>
                            <div className={styles.techSub}>FAST DELIVERY</div>
                        </div>
                    </div>
                </div>

                {/* Center: Image */}
                <div className={styles.imageColumn}>
                    <img src="/me.jpg" alt="Ivan Kurganskiy" className={styles.profileImage} />
                </div>

                {/* Right: Bio & Soft Skills */}
                <div className={styles.bioContainer}>
                    <div className={styles.bioText}>
                        <p>
                            Привет. Я Иван Курганский. Режиссер монтажа и Motion-дизайнер с 10-летним опытом.
                        </p>
                        <p>
                            Моя цель — создавать визуальный контент, который не просто выглядит красиво, но и решает задачи бизнеса. Будь то динамичный Reels для бренда или сложный документальный проект.
                        </p>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>ЛОКАЦИЯ</span>
                            <span className={styles.statValue}>MOSCOW, RU</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>ОПЫТ</span>
                            <span className={styles.statValue}>10+ ЛЕТ</span>
                        </div>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>СОФТ</span>
                            <span className={styles.statValue}>PREMIERE / AE / BLENDER</span>
                        </div>
                    </div>

                    <div className={styles.skillList}>
                        <h3 className={styles.skillHeader}>[ SOFT SKILLS ]</h3>
                        <ul className={styles.list}>
                            <li>ЧЕТКОЕ СОБЛЮДЕНИЕ ДЕДЛАЙНОВ</li>
                            <li>БЫСТРАЯ КОММУНИКАЦИЯ 24/7</li>
                            <li>КРЕАТИВНОЕ ВИДЕНИЕ ЗАДАЧИ</li>
                            <li>ПОЛНОЕ ПОГРУЖЕНИЕ В ПРОЕКТ</li>
                        </ul>
                    </div>

                </div>

            </div>

        </section>
    );
};

export default About;
