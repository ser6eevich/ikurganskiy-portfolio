import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CoverflowCarousel from '../components/CoverflowCarousel';
import styles from './ProjectView.module.css';

const Section = ({ children, className = "", style = {} }) => (
    <motion.section
        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-15% 0px -15% 0px" }}
        transition={{
            duration: 1.2,
            ease: [0.16, 1, 0.3, 1], // Custom Apple-style ease-out expo
            delay: 0.1
        }}
        className={`${className} section-spacing`}
        style={style}
    >
        {children}
    </motion.section>
);

const ProjectView = ({ source = 'project' }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    // Video Modal State - Moved up to avoid "Rendered more hooks" error
    const [selectedVideo, setSelectedVideo] = useState(null);

    // Load Project Data
    useEffect(() => {
        const endpoint = source === 'archive' ? 'archive' : 'projects';
        fetch(`/api/${endpoint}/${id}`)
            .then(res => res.json())
            .then(data => {
                setProject(data);
            })
            .catch(err => console.error("Failed to load project", err));
    }, [id, source]);

    // --- Navigation Logic ---
    const [projectsList, setProjectsList] = useState([]);
    const [nextProject, setNextProject] = useState(null);

    // Fetch List for Navigation
    useEffect(() => {
        const endpoint = source === 'archive' ? 'archive' : 'projects';
        fetch(`/api/${endpoint}`)
            .then(res => res.json())
            .then(data => setProjectsList(data))
            .catch(err => console.error("Failed to load projects list", err));
    }, [source]);

    // Determine Next Project
    useEffect(() => {
        if (projectsList.length > 0 && id) {
            const currentIndex = projectsList.findIndex(p => String(p.id) === String(id));
            if (currentIndex !== -1 && currentIndex < projectsList.length - 1) {
                setNextProject(projectsList[currentIndex + 1]);
            } else {
                setNextProject(null); // Last project or not found
            }
        }
    }, [projectsList, id]);

    // Scroll to top on navigation
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const handleNextProject = () => {
        if (nextProject) {
            const path = source === 'archive' ? `/work/${nextProject.id}` : `/project/${nextProject.id}`;
            navigate(path);
        } else {
            navigate('/', { state: { targetId: source === 'archive' ? 'works' : 'projects' } });
        }
    };

    if (!project) return <div style={{ color: 'black', padding: '2rem', textAlign: 'center' }}>Загрузка...</div>;

    // Debug logging
    console.log('ProjectView Render:', { id, project, isAnar: (project?.title?.toLowerCase().includes("anar")) });

    // Special Layout for "True/False" (ID 3 or Title match)
    const isSpecialProject = project?.title && project.title.toLowerCase().includes("правда или ложь");

    // Special Layout for Anar Dreams (Hardcoded ID 6 for safety)
    const isAnarProject = (project?.title && project.title.toLowerCase().includes("anar")) || project?.slug === 'anar-dreams-iba' || id === '6';

    // Special Layout for Kristina Egiazarova
    const isKristinaProject = (project?.title && project.title.toLowerCase().includes("kristina")) || project?.slug === 'kristina-ai-ecosystem';

    // Generic Layout Components
    const renderMedia = () => {
        if (!project?.fileUrl) return null;

        try {
            const isVideo = project.type === 'video' || (typeof project.fileUrl === 'string' && project.fileUrl.endsWith('.mp4'));

            if (isVideo) {
                return (
                    <video
                        src={project.fileUrl}
                        controls
                        autoPlay
                        muted
                        loop
                        playsInline
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                );
            }

            return <img src={project.fileUrl} alt={project.title || 'Project Media'} />;
        } catch (e) {
            console.error("Error in renderMedia:", e);
            return null;
        }
    };

    return (
        <motion.div
            className="case-study-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Video Modal Overlay */}
            {selectedVideo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0,0,0,0.9)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem'
                    }}
                    onClick={() => setSelectedVideo(null)}
                >
                    <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', aspectRatio: '9/16', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
                        <video
                            src={selectedVideo.startsWith('http') ? selectedVideo : `/uploads/${selectedVideo}`}
                            controls
                            autoPlay
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                        <button
                            onClick={() => setSelectedVideo(null)}
                            style={{
                                position: 'absolute',
                                top: '-40px',
                                right: '-10px',
                                background: 'transparent',
                                border: 'none',
                                color: 'white',
                                fontSize: '2rem',
                                cursor: 'pointer'
                            }}
                        >
                            ✕
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Navigation Overlay */}
            <nav style={{ position: 'fixed', top: 0, width: '100%', padding: '1.5rem 2rem', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', pointerEvents: 'none' }}>
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate('/', { state: { targetId: source === 'archive' ? 'works' : 'projects' } })}
                    style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(255,255,255,0.8)',
                        color: 'black',
                        border: '1px solid rgba(0,0,0,0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '30px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        pointerEvents: 'auto',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    ← BACK TO {source === 'archive' ? 'ARCHIVE' : 'HOME'}
                </motion.button>
            </nav>

            <main>
                {/* Generic / Dynamic Layout */}
                {!isSpecialProject && !isAnarProject && !isKristinaProject ? (
                    <>
                        {/* Hero Section */}
                        <Section className="content-column project-hero-spacing">
                            <span className="hero-subtitle">{project.category || 'PROJECT'} • {new Date(project.createdAt).getFullYear()}</span>
                            <h1 className="hero-title" style={{ textTransform: 'uppercase' }}>
                                {project.title}
                            </h1>
                            {project.description && (
                                <div className="block-text" style={{ color: '#666', marginBottom: '2rem' }}>
                                    {project.description}
                                </div>
                            )}
                        </Section>

                        {/* Main Media */}
                        <motion.div
                            className="media-full"
                            initial={{ scale: 0.98, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            style={{ maxWidth: '1200px', margin: '0 auto 100px auto' }}
                        >
                            {renderMedia()}
                        </motion.div>
                    </>
                ) : isSpecialProject ? (
                    /* SPECIAL LAYOUT FOR TRUE/FALSE */
                    <>
                        <Section className="content-column project-hero-spacing">
                            <span className="hero-subtitle">Монтаж • Моушн-дизайн • Саунд-дизайн</span>
                            <h1 className="hero-title" style={{ textTransform: 'uppercase' }}>
                                {project.title} — <span className="serif-accent" style={{ textTransform: 'uppercase' }}>Оформление YouTube-шоу</span>
                            </h1>
                            <div className="block-text" style={{ color: '#666' }}>
                                Комплексный пост-продакшен развлекательного формата. Главная задача — создать динамичный визуальный язык, который удерживает внимание зрителя каждую секунду видео и помогает легко считывать информацию.
                            </div>
                        </Section>

                        {/* Media Showcase (Placeholder for 4K Render) */}
                        <motion.div
                            className="media-full"
                            initial={{ scale: 0.98, opacity: 0 }}
                            whileInView={{ scale: 1, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2 }}
                            style={{ maxWidth: '1200px', margin: '0 auto 100px auto' }}
                        >
                            <img src="/uploads/preview_true_false.jpg" alt="Project Preview" />
                        </motion.div>

                        {/* Block 1: The Challenge */}
                        <Section className="content-column">
                            <h2 className="hero-title" style={{ fontSize: '2.8rem' }}>Задача и <span className="serif-accent">Решение</span></h2>
                            <div className="block-text">
                                Мы взяли сырые исходники и превратили их в полноценное шоу с узнаваемым стилем. Фокус был сделан на чистоту кадра, сочную анимацию и плотный звуковой дизайн. Никаких провисаний — только ритм и вовлечение.
                            </div>
                        </Section>

                        {/* Block 2: Dynamics */}
                        <Section className="content-column">
                            <h2 className="hero-title" style={{ fontSize: '2.8rem' }}>Динамика и <span className="serif-accent">Ритм</span></h2>
                            <div className="block-text" style={{ marginBottom: '3rem' }}>
                                Монтаж исходных материалов • Сборка лучших дублей, выстраивание правильного тайминга и удаление пауз. Монтаж задает темп всему выпуску.
                            </div>
                            <div className="media-full">
                                <img src="/uploads/dynamics.gif" alt="Dynamic Editing" />
                            </div>
                        </Section>

                        {/* Block 3: Visual Packaging */}
                        <Section className="content-column">
                            <h2 className="hero-title" style={{ fontSize: '2.8rem' }}>Визуальная <span className="serif-accent">упаковка</span></h2>
                            <div className="block-text" style={{ marginBottom: '4rem' }}>
                                Вся графика разработана в едином стиле: читабельная типографика, плавные кривые анимации и понятные образы.
                            </div>

                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '100px', alignItems: 'center' }}>
                                <div className="content-column" style={{ padding: 0 }}>
                                    <h3 className="hero-title" style={{ fontSize: '1.8rem' }}>Заставка шоу <span className="serif-accent">(Intro)</span></h3>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Лицо проекта. Короткий, сочный и запоминающийся опенер.</p>

                                    {/* Intro GIF Grid */}
                                    <div className="grid-2-col" style={{ gap: '2rem' }}>
                                        <div className="media-full" style={{ margin: 0 }}>
                                            <img src="/uploads/intro_true_false.gif" alt="Intro Animation Color" />
                                        </div>
                                        <div className="media-full" style={{ margin: 0 }}>
                                            <img src="/uploads/intro_gray_true_false.gif" alt="Intro Animation Gray" />
                                        </div>
                                    </div>
                                </div>

                                <div className="content-column" style={{ padding: 0 }}>
                                    <h3 className="hero-title" style={{ fontSize: '1.8rem' }}>Инфографика <span className="serif-accent">(Вопрос о факте)</span></h3>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Максимальная читаемость даже на экранах смартфонов.</p>
                                    <div className="media-full">
                                        <img src="/uploads/fact.gif" alt="Fact Animation" />
                                    </div>
                                </div>

                                <div className="content-column" style={{ padding: 0 }}>
                                    <h3 className="hero-title" style={{ fontSize: '1.8rem' }}>Анимация <span className="serif-accent">рассказа фактов</span></h3>
                                    <p style={{ color: '#666', marginBottom: '2rem' }}>Анимация работает как поддерживающий элемент, который визуализирует факты.</p>
                                    <div className="media-full">
                                        <img src="/uploads/facts_animation.gif" alt="Facts Animation" />
                                    </div>
                                </div>
                            </div>
                        </Section>

                        {/* Block 4: Interactive */}
                        <Section className="content-column" style={{ paddingBottom: '140px' }}>
                            <h2 className="hero-title" style={{ fontSize: '2.8rem' }}>Интерактив и <span className="serif-accent">Эмоции</span></h2>
                            <div className="grid-2-col" style={{ marginTop: '2rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <h4 className="font-mono" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', color: '#888' }}>РЕАКЦИЯ НА ОТВЕТ</h4>
                                    <div className="media-full" style={{ margin: 0 }}>
                                        <img src="/uploads/reaction.gif" alt="Reaction Animation" />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <h4 className="font-mono" style={{ fontSize: '0.8rem', marginBottom: '1.5rem', color: '#888' }}>ПЕРЕХОДЫ</h4>
                                    <div className="media-full" style={{ margin: 0 }}>
                                        <img src="/uploads/transition.gif" alt="Transition Animation" />
                                    </div>
                                </div>
                            </div>
                        </Section>
                    </>
                ) : isKristinaProject ? (
                    /* SPECIAL LAYOUT FOR KRISTINA EGIAZAROVA */
                    <>
                        {/* Hero Section */}
                        <Section className="content-column project-hero-spacing">
                            <span className="hero-subtitle">AI Implementation • Voice Cloning • Video Production</span>
                            <h1 className="hero-title" style={{ textTransform: 'uppercase', lineHeight: 1.1, margin: '1rem 0 2rem 0' }}>
                                Kristina Egiazarova — <span className="serif-accent">AI Avatar Ecosystem</span>
                            </h1>

                            <div className="block-text" style={{ color: '#ccc', marginBottom: '3rem' }}>
                                Создание экосистемы «цифровых двойников» для Кристины Егиазаровой. Цель проекта — масштабирование личного бренда и производство контента без физического участия спикера.
                            </div>

                            {/* Main Visual (Placeholder for now) */}
                            <motion.div
                                className="media-full"
                                initial={{ scale: 0.98, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 1.2 }}
                                style={{
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    background: '#111',
                                    aspectRatio: '16/9',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <div style={{ textAlign: 'center', color: '#666' }}>
                                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🧬</div>
                                    <div className="font-mono">DIGITAL TWIN VISUALIZATION</div>
                                </div>
                            </motion.div>
                        </Section>

                        {/* AI Pipeline Section */}
                        <Section className="content-column">
                            <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>AI-<span className="serif-accent">Пайплайн</span></h2>
                            <div className="block-text" style={{ marginBottom: '3rem' }}>
                                Полный цикл генеративного продакшна (GenAI), исключающий необходимость съемочных дней. Работа строилась по схеме «Text-to-Video».
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%' }}>
                                {/* Step 1 */}
                                <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
                                    <div className="font-mono" style={{ color: '#ccff00', marginBottom: '1rem' }}>01. VOICE CLONING</div>
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Синтез Голоса</h3>
                                    <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                        Обучение модели на голосе Кристины для генерации озвучки, неотличимой от оригинала.
                                    </p>
                                </div>
                                {/* Step 2 */}
                                <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
                                    <div className="font-mono" style={{ color: '#00f0ff', marginBottom: '1rem' }}>02. AVATAR GEN</div>
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Генерация Аватара</h3>
                                    <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                        Разработка 10 вариаций AI-аватаров под разные форматы и настроение контента.
                                    </p>
                                </div>
                                {/* Step 3 */}
                                <div style={{ background: '#1c1c1e', padding: '2rem', borderRadius: '16px', border: '1px solid #333' }}>
                                    <div className="font-mono" style={{ color: '#ff0055', marginBottom: '1rem' }}>03. PRODUCTION</div>
                                    <h3 style={{ color: 'white', marginBottom: '1rem' }}>Финальная Сборка</h3>
                                    <p style={{ color: '#999', fontSize: '0.9rem', lineHeight: '1.4' }}>
                                        Input: Текст. Output: Готовое видео с идеальным липсиком (lip-sync).
                                    </p>
                                </div>
                            </div>
                        </Section>

                        {/* Result Section */}
                        <Section className="content-column">
                            <h2 className="hero-title" style={{ fontSize: '2rem' }}>Результат</h2>
                            <div className="block-text" style={{ borderLeft: '4px solid #ccff00', paddingLeft: '2rem' }}>
                                Полная автоматизация рутинного контента. Заказчик получает готовые Reels и Shorts, тратя время только на согласование текста, в то время как цифровые аватары работают 24/7.
                            </div>
                        </Section>

                        {/* AI Gallery */}
                        <Section className="content-column" style={{ paddingBottom: '140px' }}>
                            <h2 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>AI <span className="serif-accent">Gallery</span></h2>

                            <div className="block-text" style={{ marginBottom: '2rem' }}>
                                Реализованные вариации аватаров и готовые рилс. Листайте вправо, чтобы увидеть больше примеров.
                            </div>

                            {/* Carousel Container */}
                            <CoverflowCarousel
                                items={[
                                    'reels1.mp4', 'Reels2.mp4', 'Reels3.mp4', 'Reels4.mp4', 'Reels5.mp4',
                                    'Reels6.mp4', 'Reels8.mp4', 'Reels9.mp4', 'Reels10.mp4', 'Reels18.mp4',
                                    'Reels37.mp4', 'Reels38.mp4', 'Reels39.mp4', 'Reels40.mp4', 'Reels41.mp4',
                                    'Reels42.mp4', 'Reels57.mp4', 'Reels58.mp4', 'Reels63.mp4'
                                ]}
                                onSelect={(item) => setSelectedVideo(item)}
                            />
                        </Section>
                    </>
                ) : (
                    /* SPECIAL LAYOUT FOR ANAR DREAMS */
                    <>
                        {/* Hero Section */}
                        <Section className="content-column project-hero-spacing">
                            <span className="hero-subtitle">Team Lead • Video Production</span>

                            {/* Logos & Title */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                <h1 className="hero-title" style={{ textTransform: 'uppercase', lineHeight: 1.1, margin: 0, textAlign: 'center' }}>
                                    Anar Dreams <span className="serif-accent">x</span>
                                </h1>
                                <img
                                    src="/uploads/iba.jpg"
                                    alt="IBA Logo"
                                    style={{ height: '60px', objectFit: 'contain', borderRadius: '4px' }}
                                />
                            </div>

                            <div className="hero-subtitle" style={{ marginTop: '0', color: '#fff', textAlign: 'center', width: '100%' }}>
                                Africa Charity Tour // Output: 50+ videos daily
                            </div>

                            {/* Centered Intro & Photo */}
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4rem', marginTop: '4rem', maxWidth: '800px', margin: '4rem auto 0 auto' }}>

                                {/* Anar Photo (Centered) */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 1 }}
                                    style={{ position: 'relative', width: '200px', height: '200px' }}
                                >
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <img
                                            src="/uploads/anar.webp"
                                            alt="Anar Dreams"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Text (Centered) */}
                                <div style={{ textAlign: 'center' }}>
                                    <div className="block-text" style={{ color: '#ccc', marginBottom: '3rem', textAlign: 'center' }}>
                                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>О проекте</h3>
                                        Международная коллаборация блогера Anar Dreams и ассоциации IBA. Социальный эксперимент и благотворительная акция в Африке.
                                    </div>

                                    <div className="block-text" style={{ color: '#ccc', marginBottom: '3rem', textAlign: 'center' }}>
                                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Реализация и Менеджмент</h3>
                                        Ключевым вызовом проекта стали сроки и объемы контента. Для реализации задачи я собрал и возглавил команду монтажеров.
                                        <br /><br />
                                        Мной был выстроен полноценный пайплайн пост-продакшна, позволяющий обрабатывать пересылаемый контент «с колес».
                                    </div>

                                    <div className="block-text" style={{ color: '#ccc', textAlign: 'center' }}>
                                        <h3 style={{ color: 'white', marginBottom: '1rem' }}>Стратегия: Охваты</h3>
                                        Главная ставка была сделана на виральность через объем. Задача — забрать максимум внимания аудитории.
                                        <br /><br />
                                        Мы вышли на темп
                                        <span style={{
                                            backgroundColor: '#ccff00',
                                            color: '#000',
                                            fontWeight: 'bold',
                                            padding: '0 8px',
                                            display: 'inline-block',
                                            transform: 'skewX(-10deg)',
                                            margin: '0 6px',
                                            // Remove shadow for Anar
                                            // boxShadow: '4px 4px 0px rgba(0,0,0,0.5)'
                                        }}>
                                            50+ готовых роликов в день
                                        </span>.
                                        Такой агрессивный постинг позволил &quot;взломать&quot; алгоритмы и получить колоссальные охваты.
                                    </div>
                                </div>

                            </div>
                        </Section>

                        {/* Showreel Section */}
                        <Section className="content-column" style={{ paddingBottom: '100px', marginTop: '4rem' }}>
                            <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Showreel</h2>

                            <CoverflowCarousel
                                items={[
                                    'IMG_1342.MOV',
                                    'IMG_9575.MOV',
                                    'IMG_9581.MOV',
                                    'VID_20240326_214450_016.mp4.mov',
                                    'IMG_1928.MOV',
                                    'olga_17.mp4'
                                ]}
                                onSelect={(item) => setSelectedVideo(item)}
                            />
                        </Section>
                    </>
                )}

                {/* Footer Nav */}
                <footer className="footer-nav">
                    <div className="content-column">
                        {!isAnarProject && !isKristinaProject && (
                            <>
                                <span className="hero-subtitle" style={{ marginBottom: '1rem' }}>ИНСТРУМЕНТАРИЙ</span>
                                <div className="font-mono" style={{ fontSize: '1rem', marginBottom: '4rem', color: 'var(--color-text)' }}>
                                    Premiere Pro • After Effects • Blender
                                </div>
                            </>
                        )}

                        <motion.button
                            onClick={handleNextProject}
                            className={styles.navBtn}
                        >
                            <span className="hero-subtitle" style={{ marginBottom: '0.5rem' }}>
                                {nextProject ? 'СЛЕДУЮЩИЙ ПРОЕКТ' : 'ЗАВЕРШИТЬ ПРОСМОТР'}
                            </span>
                            <div className="hero-title" style={{ fontSize: '2.2rem', margin: 0 }}>
                                {nextProject ? (
                                    <>
                                        {nextProject.title} <span className="serif-accent">→</span>
                                    </>
                                ) : (
                                    <>
                                        НА ГЛАВНУЮ <span className="serif-accent">✕</span>
                                    </>
                                )}
                            </div>
                        </motion.button>
                    </div>
                </footer>
            </main>
        </motion.div>
    );
};

export default ProjectView;
