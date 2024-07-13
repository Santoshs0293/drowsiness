import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import TableEditor from './TableEditor';
import io from 'socket.io-client';
import moment from 'moment-timezone';

const socket = io('http://localhost:4000'); // Connect to the signaling server

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [detections, setDetections] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [isVideoCallVisible, setIsVideoCallVisible] = useState(false);
    const [isCalling, setIsCalling] = useState(false);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStream = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersData = await axios.get('/api/tables/users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
                });
                setUsers(usersData.data);
            } catch (error) {
                console.error(error);
                alert('Error fetching users data');
            }
        };

        fetchUsers();

        socket.on('offer', async (data) => {
            if (data.target === socket.id) {
                await handleOffer(data.offer, data.from);
            }
        });

        socket.on('answer', async (data) => {
            if (data.target === socket.id) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        socket.on('ice-candidate', async (data) => {
            if (data.target === socket.id && data.candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        socket.on('endCall', () => {
            handleEndVideoCall();
        });

        socket.on('incomingCall', async (data) => {
            const confirmCall = window.confirm(`${data.name} is calling you. Do you want to accept the call?`);
            if (confirmCall) {
                await handleIncomingCall(data.from);
            }
        });

        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    const fetchUserDetails = async (userId) => {
        try {
            const logsData = await axios.get('/api/tables/logs', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const userLogs = logsData.data.filter(log => log.user_id === userId);
            userLogs.forEach(log => {
                log.timestamp = moment(log.timestamp).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            });
            setLogs(userLogs);

            const detectionsData = await axios.get('/api/tables/detections', {
                headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
            });
            const userDetections = detectionsData.data.filter(detection => detection.user_id === userId);
            userDetections.forEach(detection => {
                detection.timestamp = moment(detection.timestamp).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
            });
            setDetections(userDetections);

            setSelectedUser(userId);
            setIsDetailsVisible(true);
        } catch (error) {
            console.error(error);
            alert('Error fetching user details');
        }
    };

    const handleHideDetails = () => {
        setIsDetailsVisible(false);
        setSelectedUser(null);
    };

    const handleStartVideoCall = async (mobileNumber, name) => {
        setIsVideoCallVisible(true);
        setIsCalling(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStream.current = stream;

        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = event => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', { target: mobileNumber, candidate: event.candidate });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit('call', { mobileNumber, name });
        socket.emit('offer', { target: mobileNumber, offer, from: socket.id });
    };

    const handleOffer = async (offer, from) => {
        peerConnection.current = new RTCPeerConnection();

        peerConnection.current.ontrack = event => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', { target: from, candidate: event.candidate });
            }
        };

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStream.current = stream;

        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
        });

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);

        socket.emit('answer', { target: from, answer, from: socket.id });
    };

    const handleIncomingCall = async (from) => {
        setIsVideoCallVisible(true);

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localVideoRef.current.srcObject = stream;
        localStream.current = stream;

        peerConnection.current = new RTCPeerConnection();

        stream.getTracks().forEach(track => {
            peerConnection.current.addTrack(track, stream);
        });

        peerConnection.current.ontrack = event => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };

        peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
                socket.emit('ice-candidate', { target: from, candidate: event.candidate });
            }
        };

        const offer = await peerConnection.current.createOffer();
        await peerConnection.current.setLocalDescription(offer);

        socket.emit('offer', { target: from, offer, from: socket.id });
    };

    const handleEndVideoCall = () => {
        if (peerConnection.current) {
            peerConnection.current.close();
        }
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
        }
        setIsVideoCallVisible(false);
        setIsCalling(false);

        if (selectedUser) {
            socket.emit('endCall', { target: selectedUser });
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            <button onClick={() => { localStorage.removeItem('adminToken'); window.location = '/login'; }}>Logout</button>
            
            <h2>Users</h2>
            <TableEditor 
                data={users} 
                type="users" 
                onRowClick={fetchUserDetails} 
                onVideoCallClick={(mobileNumber, name) => isCalling ? handleEndVideoCall() : handleStartVideoCall(mobileNumber, name)} 
            />

            {isDetailsVisible && (
                <>
                    <button onClick={handleHideDetails}>Hide</button>

                    <h2>Logs for User: {selectedUser}</h2>
                    <TableEditor data={logs} type="logs" />

                    <h2>Detections for User: {selectedUser}</h2>
                    <TableEditor data={detections} type="detections" />
                </>
            )}

            {isVideoCallVisible && (
                <div>
                    <h2>Video Call</h2>
                    <video ref={localVideoRef} autoPlay playsInline muted />
                    <video ref={remoteVideoRef} autoPlay playsInline />
                    <button onClick={handleEndVideoCall}>End Call</button>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
