import React from 'react';
import styles from './Hero.module.css';

const UI = ({ onOpenModal }) => {
    return (
        <div className={styles.uiContainer}>
            {/* MAIN CONTENT GRID */}
            <div className={styles.mainGrid}>

                {/* Top Left: UTP */}
                <div className={styles.leftBlock}>
                    <div className={styles.description}>
                        [01] ВИДЕОМОНТАЖЕР<br />
                        ТЕХНОЛОГИЧЕСКИЙ СТЕК [V.2026]:<br />
                        — PREMIUM REELS & SHORT FORM CONTENT<br />
                        — РАЗРАБОТКА 3D-СЦЕН И ОКРУЖЕНИЯ<br />
                        — СОЗДАНИЕ И УПРАВЛЕНИЕ ИИ-АВАТАРАМИ<br />
                        — VFX И СЛОЖНЫЙ КОМПОЗИТИНГ<br />
                        — СЛОЖНЫЙ МОНТАЖ И ЦВЕТОКОРРЕКЦИЯ<br />
                        — ТВ-ШОУ И КРУПНЫЕ ПРОЕКТЫ
                    </div>
                </div>

                {/* Top Right: Stats */}
                <div className={styles.rightBlock}>
                    <div>[10 ЛЕТ В ИНДУСТРИИ]</div>
                    <div>[ADOBE PREMIERE / AFTER EFFECTS / BLENDER]</div>
                    <div>[YOUTUBE / REELS / TV-SHOWS / 3D VFX]</div>
                </div>

            </div>

            {/* FOOTER */}
            <div className={styles.footer}>

                {/* Bottom Left: SCROLL INDICATOR */}
                <div className={styles.scrollBlock}>
                    SCROLLING ↓
                </div>

                {/* Bottom Right: Contact */}
                <div className={styles.contactBlock}>
                    <div className={styles.avatarPlaceholder} />
                    <button className={styles.actionButton} onClick={onOpenModal}>
                        ОБСУДИТЬ ПРОЕКТ
                    </button>
                </div>
            </div>

            {/* DECORATIVE TECH LABELS - REPOSITIONED */}
            {/* Moved 4K/LOG from center to bottom left area but higher up */}
            <div className={styles.techLabel} style={{ bottom: '15%', left: '3%' }}>4K / LOG / RAW</div>

            <div className={styles.techLabel} style={{ top: '25%', left: '3%' }}>FPS: 23.976</div>
            <div className={styles.techLabel} style={{ top: '60%', right: '3%' }}>STATUS: RENDERING...</div>

        </div>
    );
};

export default UI;
