import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const loginHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/api/admin/login', { name, password });
            console.log('Login successful, token:', data.token); // Debugging log
            localStorage.setItem('adminToken', data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login error:', error.response ? error.response.data : error.message); // Debugging log
            alert('Invalid credentials');
        }
    };

    return (
        <form onSubmit={loginHandler}>
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
        </form>
    );
};

export default AdminLogin;
