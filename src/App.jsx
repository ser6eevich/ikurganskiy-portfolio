import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import ProjectEditor from './pages/Admin/ProjectEditor';
import ProjectView from './pages/ProjectView';

function App() {
    // Default to Light Mode (matches current CSS)
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Update CSS variables based on theme
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--color-bg', '#0a0a0a');
            root.style.setProperty('--color-text', '#ffffff');
            root.style.setProperty('--color-grid', 'rgba(255, 255, 255, 0.1)');
        } else {
            root.style.setProperty('--color-bg', '#ffffff');
            root.style.setProperty('--color-text', '#000000');
            root.style.setProperty('--color-grid', 'rgba(0, 0, 0, 0.15)');
        }
    }, [theme]);

    return (
        <Router>
            <AnimatedRoutes theme={theme} toggleTheme={toggleTheme} />
        </Router>
    );
}

// Separate component to use useLocation hook
function AnimatedRoutes({ theme, toggleTheme }) {
    const location = useLocation();

    // Scroll to top on Refresh (Mount)
    useEffect(() => {
        window.history.scrollRestoration = 'manual';
        window.scrollTo(0, 0);
        sessionStorage.removeItem('homeScrollPos'); // Clear saved position on full reload
    }, []);

    return (
        <AnimatePresence mode="wait">
            <div className={`app-container ${theme}`} style={{ width: '100%', minHeight: '100vh', background: 'var(--color-bg)' }}>
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<Home theme={theme} toggleTheme={toggleTheme} />} />
                    <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
                    <Route path="/admin/login" element={<Login />} />
                    <Route path="/admin/dashboard" element={<Dashboard />} />
                    <Route path="/admin/project/:id" element={<ProjectEditor />} />
                    <Route path="/project/:id" element={<ProjectView source="project" />} />
                    <Route path="/work/:id" element={<ProjectView source="archive" />} />
                </Routes>
            </div>
        </AnimatePresence>
    );
}

export default App;
