import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion } from 'framer-motion';
import styles from './ContactModal.module.css';

const FORMAT_TAGS = [
    'REELS / SHORTS',
    'YOUTUBE SHOW',
    'MOTION DESIGN',
    '3D GRAPHICS',
    'VIDEO EDITING',
    'OTHER'
];

const ContactModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        contact: '',
        description: '',
        formats: []
    });

    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormatToggle = (tag) => {
        setFormData(prev => {
            const newFormats = prev.formats.includes(tag)
                ? prev.formats.filter(f => f !== tag)
                : [...prev.formats, tag];
            return { ...prev, formats: newFormats };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/telegram/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess(); // Trigger toast in parent
                onClose();   // Close modal immediately (smoothly via AnimatePresence)
            } else {
                alert(`Ошибка: ${data.error || 'Не удалось отправить'}`);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("Ошибка сети. Попробуйте позже.");
        } finally {
            setIsLoading(false);
        }
    };

    // Close on Escape
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    const modalContent = (
        <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
            >
                <button className={styles.closeBtn} onClick={onClose}>×</button>

                <h2 className={styles.title}>Обсудить проект</h2>

                <form onSubmit={handleSubmit} className={styles.form}>

                    <div className={styles.formGroup}>
                        <label>ИМЯ</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Ваше имя"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>КОНТАКТЫ</label>
                        <input
                            type="text"
                            name="contact"
                            placeholder="Telegram / WhatsApp / Email"
                            value={formData.contact}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>ФОРМАТ</label>
                        <div className={styles.tagsContainer}>
                            {FORMAT_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    className={`${styles.tag} ${formData.formats.includes(tag) ? styles.activeTag : ''}`}
                                    onClick={() => handleFormatToggle(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>ОПИСАНИЕ</label>
                        <textarea
                            name="description"
                            placeholder="Кратко о задаче..."
                            rows="3"
                            value={formData.description}
                            onChange={handleChange}
                        ></textarea>
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                        {isLoading ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ ЗАЯВКУ'}
                    </button>

                </form>
            </motion.div>
        </motion.div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default ContactModal;
