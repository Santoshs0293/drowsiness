// VideoCall.js
import React, { useRef, useEffect } from 'react';
import io from 'socket.io-client';

const ROOM_ID = "your_room_id";  // Replace with actual room ID

const VideoCall = () => {
    const userVideo = useRef();
    const peerVideo = useRef();
    const socket = useRef();

    useEffect(() => {
        socket.current = io.connect('/');
        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            userVideo.current.srcObject = stream;
            socket.current.emit('join-room', ROOM_ID, 10);
            socket.current.on('user-connected', userId => {
                // Handle user connection
            });
        });
    }, []);

    return (
        <div>
            <video ref={userVideo} autoPlay playsInline />
            <video ref={peerVideo} autoPlay playsInline />
        </div>
    );
};

export default VideoCall;
