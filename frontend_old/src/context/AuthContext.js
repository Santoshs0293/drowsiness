import React, { createContext, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const register = async (username, password) => {
        await axios.post('/api/auth/register', { username, password });
    };

    const login = async (username, password) => {
        const res = await axios.post('/api/auth/login', { username, password });
        setUser(res.data.token);
    };

    const logout = () => {
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
