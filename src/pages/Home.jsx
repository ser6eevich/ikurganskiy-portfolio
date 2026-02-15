import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '../components/Hero';
import Featured from '../components/Featured';
import Portfolio from '../components/Portfolio';
import About from '../components/About';
import Contact from '../components/Contact';
import Header from '../components/Header';
import ContactModal from '../components/ContactModal';

const Home = ({ theme, toggleTheme }) => {
    const location = useLocation();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // 1. If targetId provided, prioritize it
        if (location.state?.targetId) {
            const elem = document.getElementById(location.state.targetId);
            if (elem) {
                setTimeout(() => {
                    elem.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
            return;
        }

        // 2. Otherwise restore scroll position
        const savedPos = sessionStorage.getItem('homeScrollPos');
        if (savedPos) {
            window.scrollTo(0, parseInt(savedPos, 10));
        }
    }, [location]);

    // Save scroll position on unmount
    useEffect(() => {
        const handleScroll = () => {
            sessionStorage.setItem('homeScrollPos', window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const openContactModal = () => setIsModalOpen(true);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Header theme={theme} toggleTheme={toggleTheme} />
            <Hero theme={theme} onOpenModal={openContactModal} />
            <Featured />
            <Portfolio />
            <About />
            <Contact onOpenModal={openContactModal} />

            <AnimatePresence>
                {isModalOpen && <ContactModal onClose={() => setIsModalOpen(false)} />}
            </AnimatePresence>
        </motion.div>
    );
};

export default Home;
