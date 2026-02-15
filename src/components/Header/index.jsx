import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

const Header = ({ toggleTheme, theme }) => {
    const [time, setTime] = useState(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }));
        }, 1000);

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            clearInterval(timer);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
            <div className={styles.logo}>[IVAN KURGANSKIY]</div>

            <div className={styles.nav}>
                <button onClick={() => scrollToSection('projects')} className={styles.navLink}>Проекты</button>
                <span className={styles.separator}>/</span>
                <button onClick={() => scrollToSection('works')} className={styles.navLink}>Работы</button>
                <span className={styles.separator}>/</span>
                <button onClick={() => scrollToSection('about')} className={styles.navLink}>Обо мне</button>
            </div>

            <div className={styles.rightHeaderGroup}>
                <button onClick={toggleTheme} className={styles.themeToggle}>
                    {theme === 'light' ? '☾ DARK' : '☀ LIGHT'}
                </button>
                <div className={styles.timeLoc}>МОСКВА, РФ {time}</div>
            </div>
        </div>
    );
};

export default Header;
