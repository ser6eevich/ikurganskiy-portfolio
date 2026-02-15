import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                navigate('/admin/dashboard');
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Server error');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#0a0a0a',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <form onSubmit={handleLogin} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                width: '300px'
            }}>
                <h2 style={{ textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>[ADMIN ACCESS]</h2>
                {error && <div style={{ color: 'red', fontSize: '0.8rem', textAlign: 'center' }}>{error}</div>}
                <input
                    type="email"
                    placeholder="EMAIL"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        outline: 'none'
                    }}
                />
                <input
                    type="password"
                    placeholder="PASSWORD"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        outline: 'none'
                    }}
                />
                <button type="submit" style={{
                    padding: '1rem',
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                }}>
                    ENTER SYSTEM
                </button>
            </form>
        </div>
    );
};

export default Login;
