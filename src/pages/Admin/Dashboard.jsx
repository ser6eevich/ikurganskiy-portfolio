import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SmartVideoPlayer from '../../components/SmartVideoPlayer';

const Dashboard = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [archive, setArchive] = useState([]);
    const [activeTab, setActiveTab] = useState('PROJECTS'); // 'PROJECTS' or 'ARCHIVE'
    const fileInputRef = useRef(null);

    // --- Video Modal State ---
    const [viewVideo, setViewVideo] = useState(null);

    // --- Upload State ---
    const [showModal, setShowModal] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadCategory, setUploadCategory] = useState('REELS');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploadOrientation, setUploadOrientation] = useState('horizontal');
    const [uploadThumbnail, setUploadThumbnail] = useState(null); // File
    const [uploadThumbnailUrl, setUploadThumbnailUrl] = useState(''); // URL
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    // --- Edit State ---
    const [editItem, setEditItem] = useState(null); // Item being edited
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editCategory, setEditCategory] = useState('REELS');
    const [editOrientation, setEditOrientation] = useState('horizontal');
    const [editThumbnail, setEditThumbnail] = useState(null); // File
    const [editThumbnailUrl, setEditThumbnailUrl] = useState(''); // URL

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) navigate('/admin/login');

        // Fetch Projects
        fetch('http://localhost:5000/api/projects')
            .then(res => res.json())
            .then(data => setProjects(data))
            .catch(err => console.error(err));

        // Fetch Archive
        fetch('http://localhost:5000/api/archive')
            .then(res => res.json())
            .then(data => setArchive(data))
            .catch(err => console.error(err));
    }, [navigate]);

    const handleEditClick = (item, e) => {
        e.stopPropagation();
        setEditItem(item);
        setEditTitle(item.title);
        setEditDescription(item.description || '');
        setEditCategory(item.category);
        setEditOrientation(item.orientation || 'horizontal');
        setEditThumbnailUrl(item.thumbnail || '');
        setEditThumbnail(null);
    };

    const uploadFileSimple = async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('http://localhost:5000/api/upload', {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error('Failed to upload file');
        const data = await res.json();
        return data.url;
    };

    const handleUpdateConfirm = async () => {
        if (!editItem) return;

        try {
            let finalThumbnailUrl = editThumbnailUrl;
            if (editThumbnail) {
                finalThumbnailUrl = await uploadFileSimple(editThumbnail);
            }

            const res = await fetch(`http://localhost:5000/api/archive/${editItem.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    category: editCategory,
                    orientation: editOrientation,
                    thumbnail: finalThumbnailUrl
                })
            });

            if (!res.ok) throw new Error('Update failed');

            const updatedItem = await res.json();

            // Update local state
            setArchive(archive.map(item => item.id === updatedItem.id ? updatedItem : item));

            // Close modal
            setEditItem(null);
        } catch (err) {
            alert('Ошибка обновления');
            console.error(err);
        }
    };


    const [uploadType, setUploadType] = useState('file'); // 'file' or 'youtube'
    const [uploadYoutubeUrl, setUploadYoutubeUrl] = useState('');

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploadFile(file);
        setUploadTitle(file.name.split('.')[0]); // Default title from filename
        setUploadDescription('');
        setUploadType('file'); // Ensure type is file
        setShowModal(true);
        // Reset inputs
        setUploadProgress(0);
        setIsUploading(false);

        // Detect Orientation
        if (file.type.startsWith('video')) {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src);
                if (video.videoHeight > video.videoWidth) {
                    setUploadOrientation('vertical');
                } else {
                    setUploadOrientation('horizontal');
                }
            };
            video.src = URL.createObjectURL(file);
        } else {
            setUploadOrientation('horizontal'); // Default for images
        }
    };

    const handleOpenUploadModal = () => {
        setUploadType('file');
        setUploadFile(null);
        setUploadYoutubeUrl('');
        setUploadTitle('');
        setUploadDescription('');
        setUploadThumbnail(null);
        setUploadThumbnailUrl('');
        setShowModal(true);
        setUploadProgress(0);
        setIsUploading(false);
    };

    const handleUploadConfirm = async () => {
        if (uploadType === 'file' && !uploadFile) return;
        if (uploadType === 'youtube' && !uploadYoutubeUrl) return;
        if (!uploadTitle) return;

        setIsUploading(true);

        try {
            // Upload thumbnail first if exists
            let thumbUrl = '';
            if (uploadThumbnail) {
                thumbUrl = await uploadFileSimple(uploadThumbnail);
            }

            // --- YOUTUBE UPLOAD PATH ---
            if (uploadType === 'youtube') {
                const res = await fetch('http://localhost:5000/api/archive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: uploadTitle,
                        fileUrl: uploadYoutubeUrl,
                        type: 'youtube', // Special type for YT
                        category: uploadCategory,
                        description: uploadDescription,
                        orientation: 'horizontal', // YouTube is always horizontal
                        thumbnail: thumbUrl
                    })
                });
                const newItem = await res.json();
                setArchive([newItem, ...archive]);
                setShowModal(false);
                setUploadYoutubeUrl('');
            } else {
                // --- FILE UPLOAD PATH ---
                const formData = new FormData();
                formData.append('file', uploadFile);

                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'http://localhost:5000/api/upload');

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percent = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(percent);
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status === 200) {
                        const uploadData = JSON.parse(xhr.responseText);

                        // Create Archive Item
                        const type = uploadFile.type.startsWith('video') ? 'video' : 'image';

                        try {
                            const res = await fetch('http://localhost:5000/api/archive', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    title: uploadTitle,
                                    fileUrl: uploadData.url,
                                    type,
                                    category: uploadCategory,
                                    description: uploadDescription,
                                    orientation: uploadOrientation,
                                    thumbnail: thumbUrl
                                })
                            });
                            const newItem = await res.json();
                            setArchive([newItem, ...archive]);
                            setShowModal(false);
                            setUploadFile(null);
                            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
                        } catch (err) {
                            alert('Ошибка сохранения в базу');
                        }
                    } else {
                        alert('Ошибка загрузки файла');
                    }
                    setIsUploading(false);
                };

                xhr.onerror = () => {
                    alert('Ошибка сети');
                    setIsUploading(false);
                };

                xhr.send(formData);
                return; // Exit here as xhr is async
            }
        } catch (err) {
            alert('Ошибка загрузки: ' + err.message);
        }
        setIsUploading(false);
    };

    const deleteProject = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Вы уверены, что хотите удалить этот проект?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/projects/${id}`, { method: 'DELETE' });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Delete failed');

            setProjects(projects.filter(p => p.id !== id));
        } catch (err) {
            console.error(err);
            alert(`Ошибка: ${err.message}`);
        }
    };

    const deleteArchiveItem = async (id) => {
        if (!confirm('Удалить эту работу?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/archive/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setArchive(archive.filter(item => item.id !== id));
        } catch (err) {
            console.error(err);
            alert('Ошибка удаления');
        }
    };

    return (
        <div style={{
            background: '#0a0a0a',
            minHeight: '100vh',
            color: '#fff',
            fontFamily: 'Inter, sans-serif',
            padding: '4rem'
        }}>
            {/* View Video Modal */}
            {viewVideo && (
                <SmartVideoPlayer
                    src={viewVideo.fileUrl}
                    title={viewVideo.title}
                    description={viewVideo.description}
                    onClose={() => setViewVideo(null)}
                />
            )}

            {/* Edit Modal */}
            {editItem && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333',
                        width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <h3 style={{ margin: 0, fontFamily: 'JetBrains Mono' }}>РЕДАКТИРОВАНИЕ</h3>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>НАЗВАНИЕ</label>
                            <input
                                value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>ОПИСАНИЕ</label>
                            <textarea
                                value={editDescription} onChange={e => setEditDescription(e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem', resize: 'none' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>КАТЕГОРИЯ</label>
                            <select
                                value={editCategory} onChange={e => setEditCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                            >
                                <option value="REELS">REELS</option>
                                <option value="YOUTUBE">YOUTUBE</option>
                                <option value="TV-SHOWS">TV-SHOWS</option>
                                <option value="VFX">VFX</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>ОРИЕНТАЦИЯ</label>
                            <select
                                value={editOrientation} onChange={e => setEditOrientation(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                            >
                                <option value="horizontal">ГОРИЗОНТАЛЬНО (16:9)</option>
                                <option value="vertical">ВЕРТИКАЛЬНО (9:16)</option>
                                <option value="square">КВАДРАТ (1:1)</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>ОБЛОЖКА (ОПЦИОНАЛЬНО)</label>
                            <input
                                type="file"
                                onChange={e => setEditThumbnail(e.target.files[0])}
                                accept="image/*"
                                style={{ width: '100%', marginTop: '0.5rem', color: '#999' }}
                            />
                            {editThumbnailUrl && !editThumbnail && (
                                <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.2rem' }}>
                                    Текущая обложка установлена
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleUpdateConfirm}
                                style={{ flex: 1, padding: '1rem', background: '#ccff00', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                            >
                                СОХРАНИТЬ
                            </button>
                            <button
                                onClick={() => setEditItem(null)}
                                style={{ flex: 1, padding: '1rem', background: 'transparent', color: '#666', border: '1px solid #333', cursor: 'pointer' }}
                            >
                                ОТМЕНА
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Upload Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        background: '#111', padding: '2rem', borderRadius: '12px', border: '1px solid #333',
                        width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <h3 style={{ margin: 0, fontFamily: 'JetBrains Mono' }}>ЗАГРУЗКА РАБОТЫ</h3>

                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                            <button
                                onClick={() => setUploadType('file')}
                                style={{
                                    flex: 1, padding: '0.6rem', cursor: 'pointer',
                                    background: uploadType === 'file' ? '#ccff00' : '#1a1a1a',
                                    color: uploadType === 'file' ? 'black' : '#888',
                                    border: '1px solid #333', fontWeight: 'bold'
                                }}
                            >
                                ФАЙЛ
                            </button>
                            <button
                                onClick={() => setUploadType('youtube')}
                                style={{
                                    flex: 1, padding: '0.6rem', cursor: 'pointer',
                                    background: uploadType === 'youtube' ? '#ccff00' : '#1a1a1a',
                                    color: uploadType === 'youtube' ? 'black' : '#888',
                                    border: '1px solid #333', fontWeight: 'bold'
                                }}
                            >
                                YOUTUBE
                            </button>
                        </div>

                        {uploadType === 'file' ? (
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>ФАЙЛ</label>
                                <input
                                    type="file"
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*"
                                    style={{ width: '100%', marginTop: '0.5rem', color: '#999' }}
                                />
                            </div>
                        ) : (
                            <div>
                                <label style={{ fontSize: '0.8rem', color: '#666' }}>ССЫЛКА НА YOUTUBE</label>
                                <input
                                    value={uploadYoutubeUrl}
                                    onChange={e => setUploadYoutubeUrl(e.target.value)}
                                    placeholder="https://youtu.be/..."
                                    style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                                />
                            </div>
                        )}

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>НАЗВАНИЕ</label>
                            <input
                                value={uploadTitle} onChange={e => setUploadTitle(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                            />
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>ОПИСАНИЕ</label>
                            <textarea
                                value={uploadDescription} onChange={e => setUploadDescription(e.target.value)}
                                rows={3}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem', resize: 'none' }}
                            />
                        </div>

                        <div>
                            <select
                                value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}
                                style={{ width: '100%', padding: '0.8rem', background: '#000', border: '1px solid #333', color: 'white', marginTop: '0.5rem' }}
                            >
                                <option value="REELS">REELS</option>
                                <option value="YOUTUBE">YOUTUBE</option>
                                <option value="TV-SHOWS">TV-SHOWS</option>
                                <option value="VFX">VFX</option>
                            </select>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.8rem', color: '#666' }}>ОБЛОЖКА (ОПЦИОНАЛЬНО)</label>
                            <input
                                type="file"
                                onChange={e => setUploadThumbnail(e.target.files[0])}
                                accept="image/*"
                                style={{ width: '100%', marginTop: '0.5rem', color: '#999' }}
                            />
                        </div>

                        {isUploading && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                                    <span>Загрузка...</span>
                                    <span>{uploadProgress}%</span>
                                </div>
                                <div style={{ width: '100%', height: '4px', background: '#333', borderRadius: '2px', overflow: 'hidden' }}>
                                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#ccff00', transition: 'width 0.2s' }}></div>
                                </div>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleUploadConfirm} disabled={isUploading}
                                style={{ flex: 1, padding: '1rem', background: '#ccff00', color: 'black', fontWeight: 'bold', border: 'none', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                            >
                                {isUploading ? 'ЗАГРУЗКА...' : 'ЗАГРУЗИТЬ'}
                            </button>
                            <button
                                onClick={() => setShowModal(false)} disabled={isUploading}
                                style={{ flex: 1, padding: '1rem', background: 'transparent', color: '#666', border: '1px solid #333', cursor: isUploading ? 'not-allowed' : 'pointer' }}
                            >
                                ОТМЕНА
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '4rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: '2rem'
            }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', margin: 0 }}>[ПАНЕЛЬ УПРАВЛЕНИЯ]</h1>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('PROJECTS')}
                            style={{
                                background: 'none', border: 'none', color: activeTab === 'PROJECTS' ? '#ccff00' : '#666',
                                cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 'bold'
                            }}
                        >
                            ПРОЕКТЫ
                        </button>
                        <button
                            onClick={() => setActiveTab('ARCHIVE')}
                            style={{
                                background: 'none', border: 'none', color: activeTab === 'ARCHIVE' ? '#ccff00' : '#666',
                                cursor: 'pointer', fontFamily: 'JetBrains Mono', fontWeight: 'bold'
                            }}
                        >
                            АРХИВ
                        </button>
                    </div>
                </div>
                <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>ВЫЙТИ</button>
            </header>

            {activeTab === 'PROJECTS' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem' }}>
                    {/* Create New Project */}
                    <div
                        style={{
                            border: '1px dashed rgba(255,255,255,0.2)', height: '200px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: '#888'
                        }}
                        onClick={() => navigate('/admin/project/new')}
                    >
                        + НОВЫЙ ПРОЕКТ
                    </div>

                    {projects.map(p => (
                        <div
                            key={p.id}
                            style={{
                                border: '1px solid rgba(255,255,255,0.1)', height: '200px', padding: '1rem',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                                cursor: 'pointer', backgroundImage: `linear-gradient(rgba(0,0,0,0.8), rgba(0,0,0,0.8)), url(${p.thumbnail})`,
                                backgroundSize: 'cover', position: 'relative'
                            }}
                            onClick={() => navigate(`/admin/project/${p.id}`)}
                        >
                            <div>
                                <h3 style={{ margin: '0 0 0.5rem 0' }}>{p.title}</h3>
                                <div style={{ opacity: 0.5, fontSize: '0.8rem' }}>{p.category}</div>
                            </div>

                            <button
                                onClick={(e) => deleteProject(p.id, e)}
                                style={{
                                    position: 'absolute', top: 10, right: 10,
                                    background: 'red', border: 'none', color: 'white',
                                    width: '24px', height: '24px', borderRadius: '50%',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'ARCHIVE' && (
                <div>
                    <div style={{ marginBottom: '2rem' }}>
                        <button
                            onClick={handleOpenUploadModal}
                            style={{ padding: '1rem 2rem', background: '#ccff00', color: '#000', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
                        >
                            + ДОБАВИТЬ РАБОТУ
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {archive.map(item => (
                            <div key={item.id} style={{ background: '#111', padding: '1rem', border: '1px solid #333' }}>
                                <div style={{ height: '150px', background: '#000', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                    {item.type === 'image' ? (
                                        <img src={item.fileUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <video
                                            src={item.fileUrl}
                                            style={{ width: '100%', height: '100%', objectFit: 'contain', cursor: 'pointer' }}
                                            muted
                                            loop
                                            playsInline
                                            onMouseEnter={e => e.target.play()}
                                            onMouseLeave={e => {
                                                e.target.pause();
                                                e.target.currentTime = 0;
                                            }}
                                            onClick={() => setViewVideo(item)}
                                        />
                                    )}
                                </div>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{item.title}</h4>
                                <div style={{ fontSize: '0.8rem', color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span>{item.category}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={(e) => handleEditClick(item, e)} style={{ color: '#ccff00', background: 'none', border: 'none', cursor: 'pointer' }}>РЕДАКТ.</button>
                                        <button onClick={(e) => { e.stopPropagation(); deleteArchiveItem(item.id); }} style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>УДАЛИТЬ</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Blocking Upload Loader */}
            {isUploading && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.95)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    zIndex: 9999, backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '2rem', marginBottom: '1rem', color: '#ccff00' }}>
                        ЗАГРУЗКА ФАЙЛА...
                    </div>
                    <div style={{ fontFamily: 'JetBrains Mono', fontSize: '4rem', fontWeight: 'bold' }}>
                        {uploadProgress}%
                    </div>
                    <div style={{ width: '300px', height: '4px', background: '#333', marginTop: '2rem', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#ccff00', transition: 'width 0.2s' }}></div>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '1rem' }}>
                        Пожалуйста, не закрывайте вкладку
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
