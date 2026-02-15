import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

const ProjectEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [elements, setElements] = useState([]);
    const [selectedId, setSelectedId] = useState(null);

    // Tools
    const [activeTool, setActiveTool] = useState('select');

    // History
    const [history, setHistory] = useState([]);

    // Canvas State
    const [scale, setScale] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // Drawing
    const [currentPath, setCurrentPath] = useState([]);
    const [drawingColor, setDrawingColor] = useState('#ccff00');
    const [drawingWidth, setDrawingWidth] = useState(5);

    // Resizing
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ width: 0, fontSize: 0 });
    const dragStartMousePos = useRef({ x: 0, y: 0 }); // New Ref for Resize Start Pos

    const lastMousePos = useRef({ x: 0, y: 0 });
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);

    // Load Project
    useEffect(() => {
        if (id === 'new') {
            setProject({ title: 'Новый проект', slug: '', category: 'REELS', thumbnail: '' });
        } else {
            fetch(`/api/projects/${id}`)
                .then(res => res.json())
                .then(data => {
                    setProject(data);
                    if (data.elements) {
                        setElements(data.elements.map(el => ({
                            ...el,
                            styles: typeof el.styles === 'string' ? JSON.parse(el.styles) : el.styles
                        })));
                    }
                });
        }
    }, [id]);

    // History
    const addToHistory = () => {
        setHistory(prev => [...prev.slice(-19), elements]);
    };

    const handleUndo = () => {
        if (history.length === 0) return;
        const previous = history[history.length - 1];
        setElements(previous);
        setHistory(prev => prev.slice(0, -1));
    };

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                handleUndo();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [history, elements]);

    // --- ZOOM (FIXED) ---
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                const zoomSensitivity = 0.001;
                setScale(prevScale => {
                    const newScale = Math.min(Math.max(0.1, prevScale - e.deltaY * zoomSensitivity), 5);
                    return newScale;
                });
            }
        };

        const container = canvasRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel, { passive: false });
        }
        return () => {
            if (container) container.removeEventListener('wheel', handleWheel);
        };
    }, []);

    // --- MOUSE HANDLERS ---
    const handleMouseDown = (e) => {
        if (isResizing) return;

        // Middle Mouse (1) for Pan
        if (e.button === 1) {
            e.preventDefault();
            setIsPanning(true);
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        if (activeTool === 'draw' && e.button === 0) {
            addToHistory();
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / scale;
            const y = (e.clientY - rect.top - pan.y) / scale;
            setCurrentPath([{ x, y }]);
        }

        if (activeTool === 'eraser' && e.button === 0) {
            addToHistory();
            handleEraser(e);
        }
    };

    const handleMouseMove = (e) => {
        // Panning
        if (isPanning) {
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
            lastMousePos.current = { x: e.clientX, y: e.clientY };
            return;
        }

        // Resizing (FIXED: Using total delta from start)
        if (isResizing && selectedId) {
            // Calculate total distance moved since resize started
            const totalDx = (e.clientX - dragStartMousePos.current.x) / scale;

            const el = elements.find(el => el.id === selectedId);
            if (el) {
                if (el.type === 'text') {
                    // Update font size based on total delta
                    const newFontSize = Math.max(10, resizeStart.fontSize + totalDx * 0.5);
                    updateElement(selectedId, { styles: { ...el.styles, fontSize: newFontSize } }, false);
                } else {
                    // Update width based on total delta
                    const newWidth = Math.max(50, resizeStart.width + totalDx);
                    updateElement(selectedId, { width: newWidth }, false);
                }
            }
            // Do NOT update lastMousePos for resizing logic, as we use absolute delta from start
            return;
        }

        // Drawing
        if (activeTool === 'draw' && currentPath.length > 0) {
            const rect = canvasRef.current.getBoundingClientRect();
            const x = (e.clientX - rect.left - pan.x) / scale;
            const y = (e.clientY - rect.top - pan.y) / scale;
            setCurrentPath(prev => [...prev, { x, y }]);
        }

        // Eraser (Drag)
        if (activeTool === 'eraser' && e.buttons === 1) {
            handleEraser(e);
        }
    };

    const handleMouseUp = () => {
        setIsPanning(false);
        setIsResizing(false);

        if (activeTool === 'draw' && currentPath.length > 1) {
            const newEl = {
                id: Date.now(),
                type: 'draw',
                content: JSON.stringify(currentPath),
                x: 0, y: 0, width: 0, height: 0,
                styles: { stroke: drawingColor, strokeWidth: drawingWidth, zIndex: elements.length + 1 }
            };
            setElements(prev => [...prev, newEl]);
            setCurrentPath([]);
        } else if (activeTool === 'draw') {
            setCurrentPath([]);
        }
    };

    const handleEraser = (e) => {
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target) return;

        const elementWrapper = target.closest('[data-element-id]');
        if (elementWrapper) {
            const id = Number(elementWrapper.getAttribute('data-element-id'));
            setElements(prev => prev.filter(el => el.id !== id));
        }
    };

    // --- RESIZE START (FIXED) ---
    const handleResizeStart = (e, el) => {
        addToHistory();
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        setSelectedId(el.id);

        // Store absolute start position
        dragStartMousePos.current = { x: e.clientX, y: e.clientY };

        // Store initial values
        setResizeStart({
            width: el.width,
            fontSize: el.styles?.fontSize || 32
        });
    };

    // --- UPLOAD & ELEMENTS ---
    const handleFileUpload = async (e, isThumbnail = false) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const data = await res.json();
            if (isThumbnail) {
                setProject(prev => ({ ...prev, thumbnail: data.url }));
            } else {
                addToHistory();
                const type = file.type.startsWith('video') ? 'video' : 'image';
                addElement(type, data.url);
            }
        } catch (err) {
            console.error('Upload failed', err);
            alert('Ошибка загрузки');
        }
    };

    const addElement = (type, content = null) => {
        addToHistory();
        const confirmCenter = {
            x: (-pan.x + window.innerWidth / 2) / scale - 150,
            y: (-pan.y + window.innerHeight / 2) / scale - 100
        };
        const newEl = {
            id: Date.now(),
            type,
            content: content || (type === 'text' ? 'Текст' : 'https://placehold.co/300x200'),
            x: confirmCenter.x,
            y: confirmCenter.y,
            width: 300,
            height: type === 'text' ? 50 : 200,
            styles: { zIndex: elements.length + 1, fontSize: 32 }
        };
        setElements(prev => [...prev, newEl]);
    };

    const updateElement = (elId, newData, saveHistory = true) => {
        if (saveHistory) addToHistory();
        setElements(prev => prev.map(el => el.id === elId ? { ...el, ...newData } : el));
    };

    const saveProject = async () => {
        const token = localStorage.getItem('token');
        let projectId = id;

        if (id === 'new') {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            });
            const data = await res.json();
            if (data.error) return alert(data.error);
            projectId = data.id;
            navigate(`/admin/project/${projectId}`, { replace: true });
        } else {
            await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project)
            });
        }
        await fetch(`/api/projects/${projectId}/elements`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ elements })
        });
        alert('Сохранено!');
    };

    const renderPath = (points, color, width) => {
        if (!points || points.length < 2) return null;
        const d = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
        return <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    };

    if (!project) return <div style={{ color: 'white' }}>Загрузка...</div>;

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#050505', color: '#eee', fontFamily: 'Inter, sans-serif' }}>
            {/* Toolbar */}
            <div style={{ width: '280px', borderRight: '1px solid #222', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem', zIndex: 100, background: '#0a0a0a', overflowY: 'auto' }}>
                <div>
                    <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: '#666', marginBottom: '1rem', letterSpacing: '1px' }}>ИНСТРУМЕНТЫ</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                        {/* Tools Row */}
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => setActiveTool('select')} style={{ flex: 1, padding: '0.6rem', cursor: 'pointer', background: activeTool === 'select' ? '#333' : '#1a1a1a', border: '1px solid #333', color: '#ddd', borderRadius: '4px' }}>🖱</button>
                            <button onClick={() => setActiveTool('draw')} style={{ flex: 1, padding: '0.6rem', cursor: 'pointer', background: activeTool === 'draw' ? '#ccff00' : '#1a1a1a', border: '1px solid #333', color: activeTool === 'draw' ? 'black' : '#ddd', borderRadius: '4px' }}>✎</button>
                            <button onClick={() => setActiveTool('eraser')} style={{ flex: 1, padding: '0.6rem', cursor: 'pointer', background: activeTool === 'eraser' ? '#ff3333' : '#1a1a1a', border: '1px solid #333', color: activeTool === 'eraser' ? 'white' : '#ddd', borderRadius: '4px' }}>⌫</button>
                        </div>

                        {activeTool === 'draw' && (
                            <div style={{ display: 'flex', gap: '5px' }}>
                                <input type="color" value={drawingColor} onChange={e => setDrawingColor(e.target.value)} style={{ flex: 1, height: '30px', border: 'none', padding: 0 }} />
                                <input type="number" value={drawingWidth} onChange={e => setDrawingWidth(Number(e.target.value))} style={{ width: '60px', background: '#222', border: '1px solid #444', color: 'white', paddingLeft: '5px' }} />
                            </div>
                        )}

                        <button onClick={handleUndo} disabled={history.length === 0} style={{ padding: '0.8rem', cursor: history.length === 0 ? 'not-allowed' : 'pointer', background: '#1a1a1a', border: '1px solid #333', color: '#ddd', borderRadius: '4px', opacity: history.length === 0 ? 0.5 : 1 }}>
                            ↩ ОТМЕНИТЬ
                        </button>

                        <hr style={{ width: '100%', borderColor: '#222' }} />

                        <button onClick={() => addElement('text')} style={{ padding: '0.8rem', cursor: 'pointer', background: '#1a1a1a', border: '1px solid #333', color: '#ddd', borderRadius: '4px' }}>
                            <span style={{ fontSize: '1.1rem', marginRight: '5px' }}>T</span> ТЕКСТ
                        </button>

                        <button onClick={() => fileInputRef.current.click()} style={{ padding: '0.8rem', cursor: 'pointer', background: '#ccff00', border: 'none', color: 'black', fontWeight: 'bold', borderRadius: '4px' }}>
                            + МЕДИА
                        </button>

                        <div style={{ marginTop: '1rem' }}>
                            <h3 style={{ fontFamily: 'JetBrains Mono', fontSize: '0.9rem', color: '#666', marginBottom: '1rem', letterSpacing: '1px' }}>НАСТРОЙКИ</h3>
                            <input value={project.title} onChange={e => setProject({ ...project, title: e.target.value })} style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '0.6rem', color: 'white', borderRadius: '4px', marginBottom: '0.5rem' }} placeholder="Название" />
                            <select value={project.category} onChange={e => setProject({ ...project, category: e.target.value })} style={{ width: '100%', background: '#111', border: '1px solid #333', padding: '0.6rem', color: 'white', borderRadius: '4px' }}>
                                <option value="REELS">REELS</option>
                                <option value="YOUTUBE">YOUTUBE</option>
                                <option value="TV-SHOWS">TV-SHOWS</option>
                                <option value="VFX">VFX</option>
                                <option value="MOTION">MOTION</option>
                            </select>
                            <div style={{ marginTop: '0.5rem', width: '100%', height: '80px', background: '#111', border: '1px dashed #333', backgroundImage: `url(${project.thumbnail})`, backgroundSize: 'cover', cursor: 'pointer' }} onClick={() => thumbnailInputRef.current.click()} />
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button onClick={saveProject} style={{ width: '100%', padding: '1rem', background: '#fff', color: 'black', fontWeight: 'bold', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>СОХРАНИТЬ</button>
                    <button onClick={() => navigate('/admin/dashboard')} style={{ width: '100%', padding: '1rem', background: 'transparent', color: '#666', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>← НАЗАД</button>
                </div>
            </div>

            {/* Canvas */}
            <div
                style={{
                    flex: 1, position: 'relative', overflow: 'hidden',
                    background: '#050505',
                    backgroundImage: 'radial-gradient(#222 1px, transparent 1px)',
                    backgroundSize: `${20 * scale}px ${20 * scale}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`,
                    cursor: activeTool === 'draw' ? 'crosshair' : (activeTool === 'eraser' ? 'not-allowed' : (isPanning ? 'grabbing' : 'auto')),
                    userSelect: 'none' // Prevent text selection while interacting
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onClick={() => setSelectedId(null)}
            >
                <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(0,0,0,0.7)', padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.75rem', color: '#888', pointerEvents: 'none', zIndex: 10 }}>
                    ALT + Скролл (Зум) | Колесо (Перемещение)
                </div>

                <div style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
                    transformOrigin: '0 0',
                    width: '100%', height: '100%'
                }}>
                    {elements.filter(el => el.type !== 'draw').map(el => (
                        <Draggable
                            key={el.id}
                            position={{ x: el.x, y: el.y }}
                            scale={scale}
                            disabled={activeTool !== 'select'}
                            onStop={(e, data) => updateElement(el.id, { x: data.x, y: data.y })}
                        >
                            <div
                                data-element-id={el.id}
                                style={{
                                    position: 'absolute',
                                    cursor: activeTool === 'select' ? 'move' : 'default',
                                    border: selectedId === el.id ? '2px solid #ccff00' : '2px dashed transparent',
                                    width: el.type === 'text' ? 'auto' : el.width,
                                    transition: 'border-color 0.1s',
                                    zIndex: el.styles?.zIndex || 1,
                                    ...el.styles
                                }}
                                onClick={(e) => {
                                    if (activeTool === 'eraser') return;
                                    e.stopPropagation();
                                    setSelectedId(el.id);
                                }}
                            >
                                {el.type === 'text' ? (
                                    <textarea
                                        value={el.content}
                                        onChange={(e) => updateElement(el.id, { content: e.target.value }, false)}
                                        style={{
                                            background: 'transparent', border: 'none', color: 'white',
                                            fontSize: el.styles?.fontSize || 32,
                                            fontWeight: 'bold', fontFamily: 'Helvetica, Arial, sans-serif',
                                            resize: 'none', overflow: 'hidden', width: '100%', minWidth: '100px', lineHeight: 1.2
                                        }}
                                    />
                                ) : el.type === 'video' ? (
                                    <video src={el.content} autoPlay loop muted style={{ width: '100%', height: 'auto', pointerEvents: 'none', display: 'block' }} />
                                ) : (
                                    <img src={el.content} alt="element" style={{ width: '100%', height: 'auto', pointerEvents: 'none', display: 'block' }} />
                                )}

                                {selectedId === el.id && activeTool === 'select' && (
                                    <>
                                        <div
                                            onMouseDown={(e) => handleResizeStart(e, el)}
                                            style={{ position: 'absolute', bottom: -10, right: -10, width: '20px', height: '20px', background: '#ccff00', borderRadius: '50%', cursor: 'nwse-resize', zIndex: 20 }}
                                        />
                                        <button
                                            onClick={(e) => { e.stopPropagation(); addToHistory(); setElements(elements.filter(e1 => e1.id !== el.id)); }}
                                            style={{ position: 'absolute', top: -15, right: -15, background: 'red', width: '30px', height: '30px', borderRadius: '50%', border: '2px solid white', color: 'white', cursor: 'pointer', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        >
                                            ×
                                        </button>
                                    </>
                                )}
                            </div>
                        </Draggable>
                    ))}

                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                        {elements.filter(el => el.type === 'draw').map(el => {
                            const points = typeof el.content === 'string' ? JSON.parse(el.content) : el.content;
                            return (
                                <g key={el.id} data-element-id={el.id} style={{ pointerEvents: 'all' }}>
                                    <path d={`M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')} stroke="transparent" strokeWidth={Number(el.styles.strokeWidth) + 20} fill="none" />
                                    {renderPath(points, el.styles.stroke, el.styles.strokeWidth)}
                                </g>
                            )
                        })}
                        {activeTool === 'draw' && renderPath(currentPath, drawingColor, drawingWidth)}
                    </svg>
                </div>
            </div>

            <input type="file" ref={thumbnailInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, true)} />
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, false)} accept="image/*,video/*" />
        </div>
    );
};

export default ProjectEditor;
