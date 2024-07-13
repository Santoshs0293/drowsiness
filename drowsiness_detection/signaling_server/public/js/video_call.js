// user_signaling_server/public/js/video_call.js

document.addEventListener('DOMContentLoaded', () => {
    const socket = io('http://localhost:4001');
    const localVideo = document.getElementById('localVideo');
    const receiveCallButton = document.getElementById('receiveCall');
    const endCallButton = document.getElementById('endCall');
    let localStream = null;
    let peerConnection = null;

    socket.on('offer', async (data) => {
        receiveCallButton.style.display = 'block';
        receiveCallButton.onclick = async () => {
            peerConnection = new RTCPeerConnection();

            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    socket.emit('ice-candidate', { target: data.from, candidate: event.candidate });
                }
            };

            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideo.srcObject = stream;
            localStream = stream;

            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });

            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            socket.emit('answer', { target: data.from, answer, from: socket.id });
            
            receiveCallButton.style.display = 'none';
            endCallButton.style.display = 'block';
        };
    });

    socket.on('answer', async (data) => {
        if (data.target === socket.id) {
            await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    });

    socket.on('ice-candidate', async (data) => {
        if (data.target === socket.id && data.candidate) {
            await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    });

    socket.on('endCall', () => {
        handleEndVideoCall();
    });

    const handleEndVideoCall = () => {
        if (peerConnection) {
            peerConnection.close();
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        endCallButton.style.display = 'none';
        socket.emit('endCall');
    };

    endCallButton.onclick = handleEndVideoCall;
});
