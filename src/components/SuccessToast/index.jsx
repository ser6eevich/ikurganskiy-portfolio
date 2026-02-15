import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './SuccessToast.module.css';

const SuccessToast = ({ isVisible, onClose, title = "SUCCESS", message = "Message sent successfully" }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={styles.toast}
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                    <div className={styles.iconContainer}>
                        ✓
                    </div>
                    <div className={styles.content}>
                        <div className={styles.title}>{title}</div>
                        <div className={styles.message}>{message}</div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessToast;
