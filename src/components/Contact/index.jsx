import React from 'react';
import styles from './Contact.module.css';

const Contact = ({ onOpenModal }) => {
    return (
        <footer className={styles.footerSection}>
            <div className={styles.mainContent}>

                {/* Left: CTA & Info */}
                <div className={styles.infoCol}>
                    <h2 className={styles.ctaText}>
                        ЕСТЬ ПРОЕКТ?<br />
                        ДАВАЙ ОБСУДИМ.
                    </h2>

                    <button className={styles.ctaButton} onClick={onOpenModal}>
                        СВЯЗАТЬСЯ ↗
                    </button>

                    <div className={styles.links}>
                        <a href="https://t.me/ser6eevich" target="_blank" rel="noreferrer" className={styles.socialLink}>TELEGRAM</a>
                        <a href="https://instagram.com/ser6eevich" target="_blank" rel="noreferrer" className={styles.socialLink}>INSTAGRAM</a>
                        <a href="mailto:kuraga00707@gmail.com" className={styles.socialLink}>EMAIL</a>
                    </div>
                </div>

                {/* Right: Location/Copyright replaced form */}
                <div className={styles.footerRight}>
                    <div className={styles.location}>
                        MOSCOW, RUSSIA<br />
                        AVAILABLE WORLDWIDE
                    </div>

                    <div className={styles.copyright}>
                        © 2026 IVAN KURGANSKIY. ALL RIGHTS RESERVED.
                    </div>
                </div>

            </div>
        </footer>
    );
};

export default Contact;
