import React from 'react';
import styles from './Reviews.module.css';

const reviews = [
    {
        id: 1,
        client: "ALEX GRIN",
        role: "MUSIC ARTIST",
        text: "Иван — это машина. Монтаж клипа превзошел все ожидания. Он не просто склеил кадры, он создал атмосферу, которая вывела трек на новый уровень.",
        year: "2024",
        image: "https://placehold.co/100x100/333/FFF?text=AG"
    },
    {
        id: 2,
        client: "TECH STARTUP 'NEXUS'",
        role: "CEO",
        text: "Работали над презентацией продукта. Четкое понимание задачи, дедлайны соблюдены минута в минуту. Визуал позволил нам привлечь инвестиции.",
        year: "2025",
        image: "https://placehold.co/100x100/444/FFF?text=NX"
    },
    {
        id: 3,
        client: "FASHION BRAND 'VOID'",
        role: "CREATIVE DIRECTOR",
        text: "Эстетика и чувство стиля на высоте. Мы искали того, кто поймет наш вайб без лишних слов. Иван сделал именно то, что было нужно. 10/10.",
        year: "2024",
        image: "https://placehold.co/100x100/555/FFF?text=VD"
    }
];

const Reviews = () => {
    return (
        <section id="reviews" className={styles.reviewsSection}>
            <div className={styles.header}>
                <h2 className={styles.title}>[ ОТЗЫВЫ ]</h2>
            </div>

            <div className={styles.grid}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <img src={review.image} alt={review.client} className={styles.avatar} />
                            <div className={styles.clientInfo}>
                                <span className={styles.client}>{review.client}</span>
                                <span className={styles.role}>{review.role}</span>
                            </div>
                        </div>
                        <p className={styles.text}>"{review.text}"</p>
                        <div className={styles.footer}>
                            <span>// {review.year}</span>
                            <span className={styles.stars}>★★★★★</span>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Reviews;
