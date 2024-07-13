// Dashboard.js
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        const fetchFiles = async () => {
            const res = await axios.get('/api/files', { headers: { 'x-auth-token': user } });
            setFiles(res.data);
        };
        fetchFiles();
    }, [user]);

    return (
        <div>
            <h1>Dashboard</h1>
            <ul>
                {files.map(file => (
                    <li key={file._id}>
                        <img src={`/${file.imagePath}`} alt="Drowsiness" />
                        <video src={`/${file.videoPath}`} controls></video>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;