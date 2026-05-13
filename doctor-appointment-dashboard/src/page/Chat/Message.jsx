import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import moment from 'moment';
import { FiSend, FiImage, FiMoreVertical, FiPhone, FiVideo, FiSmile, FiLink, FiCameraOff, FiMicOff, FiMic, FiCamera, FiPhoneOff, FiAlertCircle } from "react-icons/fi";
import { PiChecks } from "react-icons/pi";
import AgoraRTC from 'agora-rtc-sdk-ng';
import { initializeSocket, getSocket } from "../../services/socketService";
import { BASE_URL } from "../../utils/constants";

// Configure Agora logging
AgoraRTC.setLogLevel(3); // 0: Debug, 1: Info, 2: Warning, 3: Error, 4: None

const MessagePage = () => {
    const params = useParams();
    const navigate = useNavigate();
    const appointmentId = params.id === 'general' ? undefined : params.id;
    const currentUser = useSelector((state) => state.auth.user);
    const currentUserId = currentUser?._id || currentUser?.id;
    const isSocketConnected = useSelector((state) => state.socket.isConnected);
    const userRole = currentUser?.role;
    
    const [messageInput, setMessageInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [receiver, setReceiver] = useState({
        fullName: "Loading...",
        profileImage: "",
        online: false,
        _id: ""
    });
    const [error, setError] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [conversationStatus, setConversationStatus] = useState("active");
    const [conversationId, setConversationId] = useState(null);
    const [isSendingCallLink, setIsSendingCallLink] = useState(false);
    const [conversation, setConversation] = useState(null);
    
    // Agora video call states
    const [isInCall, setIsInCall] = useState(false);
    const [agoraClient, setAgoraClient] = useState(null);
    const [localVideoTrack, setLocalVideoTrack] = useState(null);
    const [localAudioTrack, setLocalAudioTrack] = useState(null);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [activeCallData, setActiveCallData] = useState(null);
    const [isAudioMuted, setIsAudioMuted] = useState(false);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [callError, setCallError] = useState(null);
    const [callWarning, setCallWarning] = useState(null);
    const [isRequestingPermissions, setIsRequestingPermissions] = useState(false);
    const [isJoiningCall, setIsJoiningCall] = useState(false);
    const [showCallInvitation, setShowCallInvitation] = useState(null);
    const [hasCameraAccess, setHasCameraAccess] = useState(true);
    const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState(true);
    
    const messagesEndRef = useRef(null);
    const socketInitialized = useRef(false);
    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});
    const mediaStreamRef = useRef(null);
    
    const [loading, setLoading] = useState({
        initial: true,
        messages: true,
        socketConnection: true
    });

    // Filter messages to only show those for the current conversation
    const filteredMessages = useMemo(() => {
        if (!conversationId || !messages) return [];
        
        return messages.filter(msg => 
            msg.conversationId === conversationId ||
            !msg.conversationId
        ).sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    }, [messages, conversationId]);

    // Check available devices with better error handling
    const checkAvailableDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const potentialCamera = devices.some(device => device.kind === 'videoinput');
            const potentialMicrophone = devices.some(device => device.kind === 'audioinput');
            
            if (!potentialCamera && !potentialMicrophone) {
                setCallWarning('No camera or microphone found on this device.');
                setHasCameraAccess(false);
                setHasMicrophoneAccess(false);
                return { hasCamera: false, hasMicrophone: false };
            }
            
            let hasCamera = false;
            let hasMicrophone = false;
            let audioError = null;
            let videoError = null;
            
            // Test microphone separately first
            if (potentialMicrophone) {
                try {
                    const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
                    audioStream.getTracks().forEach(track => track.stop());
                    hasMicrophone = true;
                    console.log('Microphone access verified');
                } catch (error) {
                    console.log('Microphone check error:', error.name);
                    audioError = error;
                    hasMicrophone = false;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Test camera separately
            if (potentialCamera) {
                try {
                    const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    videoStream.getTracks().forEach(track => track.stop());
                    hasCamera = true;
                    console.log('Camera access verified');
                } catch (error) {
                    console.log('Camera check error:', error.name);
                    videoError = error;
                    hasCamera = false;
                }
            }
            
            // Provide specific feedback
            if (!hasCamera && !hasMicrophone) {
                if (videoError?.name === 'NotReadableError' || audioError?.name === 'NotReadableError') {
                    setCallWarning('Camera and/or microphone are currently in use by another application. Please close those applications and try again.');
                } else if (videoError?.name === 'NotAllowedError' || audioError?.name === 'NotAllowedError') {
                    setCallWarning('Camera and microphone permissions denied. Please allow access in your browser settings and refresh the page.');
                } else {
                    setCallWarning('Unable to access camera or microphone. Please check your device and browser permissions.');
                }
            } else if (!hasCamera && videoError) {
                if (videoError.name === 'NotReadableError') {
                    setCallWarning('Camera is in use. You can continue with audio only.');
                } else if (videoError.name === 'NotAllowedError') {
                    setCallWarning('Camera permission denied. You can continue with audio only.');
                } else {
                    setCallWarning('Camera unavailable. Continuing with audio only.');
                }
            } else if (!hasMicrophone && audioError) {
                if (audioError.name === 'NotReadableError') {
                    setCallWarning('Microphone is in use. You can continue with video only.');
                } else if (audioError.name === 'NotAllowedError') {
                    setCallWarning('Microphone permission denied. You can continue with video only.');
                } else {
                    setCallWarning('Microphone unavailable. Continuing with video only.');
                }
            }
            
            setHasCameraAccess(hasCamera);
            setHasMicrophoneAccess(hasMicrophone);
            
            return { hasCamera, hasMicrophone };
            
        } catch (error) {
            console.error('Failed to check devices:', error);
            setCallWarning('Unable to check camera/microphone availability.');
            return { hasCamera: true, hasMicrophone: true };
        }
    };

    // Request media permissions
    const requestMediaPermissions = async (showModal = false) => {
        if (showModal) {
            setIsRequestingPermissions(true);
        }
        setCallError(null);
        
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const hasCamera = devices.some(device => device.kind === 'videoinput');
            const hasMicrophone = devices.some(device => device.kind === 'audioinput');
            
            if (!hasCamera && !hasMicrophone) {
                setIsRequestingPermissions(false);
                setCallError('No camera or microphone found. Please connect a device and try again.');
                return false;
            }
            
            const constraints = {
                audio: hasMicrophone ? {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                } : false,
                video: hasCamera ? {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    frameRate: { ideal: 15 }
                } : false
            };
            
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            
            // Store and stop the stream
            mediaStreamRef.current = stream;
            stream.getTracks().forEach(track => track.stop());
            
            console.log('Media permissions granted');
            setIsRequestingPermissions(false);
            
            if (!hasCamera) {
                setCallWarning('Camera not found. You can join with audio only.');
            } else if (!hasMicrophone) {
                setCallWarning('Microphone not found. You can join with video only.');
            }
            
            setHasCameraAccess(hasCamera);
            setHasMicrophoneAccess(hasMicrophone);
            
            return true;
            
        } catch (error) {
            console.error('Failed to get media permissions:', error);
            setIsRequestingPermissions(false);
            
            let errorMessage = 'Unable to access camera/microphone. ';
            
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera/microphone access denied. Please click the camera icon in your browser\'s address bar and allow access, then try again.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera or microphone found. Please connect a device and try again.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera/microphone is already in use by another application. Please close other apps and try again.';
            } else if (error.name === 'OverconstrainedError') {
                errorMessage = 'Camera/microphone doesn\'t meet requirements. Trying with default settings...';
            } else if (error.name === 'SecurityError') {
                errorMessage = 'Security error. Please ensure you\'re using HTTPS or localhost.';
            } else {
                errorMessage += error.message || 'Please check your device and browser permissions.';
            }
            
            setCallError(errorMessage);
            return false;
        }
    };

    // Clean up media tracks
    const cleanupMediaTracks = useCallback(() => {
        console.log('Cleaning up media tracks...');
        
        if (localAudioTrack) {
            try {
                localAudioTrack.stop();
                localAudioTrack.close();
            } catch (e) {
                console.error('Error closing audio track:', e);
            }
            setLocalAudioTrack(null);
        }
        
        if (localVideoTrack) {
            try {
                localVideoTrack.stop();
                localVideoTrack.close();
            } catch (e) {
                console.error('Error closing video track:', e);
            }
            setLocalVideoTrack(null);
        }
        
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    }, [localAudioTrack, localVideoTrack]);

    // Join Agora call
    const handleJoinCall = async (agoraData) => {
        try {
            setIsJoiningCall(true);
            console.log('=== Starting Agora Call Join Process ===');
            console.log('Raw agora data:', agoraData);
            setCallError(null);
            setCallWarning(null);
            
            // Parse Agora data
            let parsedAgoraData;
            try {
                if (typeof agoraData === 'string') {
                    parsedAgoraData = JSON.parse(agoraData);
                } else {
                    parsedAgoraData = agoraData;
                }
                console.log('Parsed Agora data:', parsedAgoraData);
            } catch (parseError) {
                console.error('Failed to parse Agora data:', parseError);
                setCallError('Invalid video call data format');
                setIsJoiningCall(false);
                return;
            }

            // Validate required fields
            if (!parsedAgoraData.channelName || !parsedAgoraData.appId) {
                setCallError('Invalid video call configuration');
                setIsJoiningCall(false);
                return;
            }

            // Check device availability
            const { hasCamera, hasMicrophone } = await checkAvailableDevices();
            
            if (!hasCamera && !hasMicrophone) {
                setCallWarning('No devices found, but you can still join to receive audio/video.');
            }

            // Request permissions
            if (hasCamera || hasMicrophone) {
                const hasPermissions = await requestMediaPermissions(true);
                if (!hasPermissions && callError?.includes('Permission request cancelled')) {
                    setIsJoiningCall(false);
                    return;
                }
            }

            setActiveCallData(parsedAgoraData);
            setShowCallInvitation(null);

            // Initialize Agora client
            const client = AgoraRTC.createClient({ 
                mode: 'rtc', 
                codec: 'vp8' 
            });

            // Get appropriate token and UID based on user role
            let token;
            let uid;
            
            if (userRole === 'doctor' || userRole === 'superAdmin') {
                token = parsedAgoraData.doctor?.token;
                uid = parsedAgoraData.doctor?.uid;
                console.log('Joining as doctor/admin - UID:', uid);
            } else {
                token = parsedAgoraData.patient?.token;
                uid = parsedAgoraData.patient?.uid;
                console.log('Joining as patient - UID:', uid);
            }

            const joinUid = uid;

            console.log('User role:', userRole);
            console.log('Using token:', token ? 'Present' : 'Missing');
            console.log('Using UID:', uid);
            console.log('Join UID:', joinUid);

            if (!token || uid === undefined || uid === null) {
                setCallError('Missing authentication token or UID for video call');
                setIsJoiningCall(false);
                return;
            }

            // Join the channel
            try {
                console.log('Joining channel:', {
                    appId: parsedAgoraData.appId,
                    channelName: parsedAgoraData.channelName,
                    uid: joinUid
                });
                
                await client.join(
                    parsedAgoraData.appId,
                    parsedAgoraData.channelName,
                    token,
                    joinUid
                );
                console.log('✓ Successfully joined channel');
            } catch (joinError) {
                console.error('Failed to join channel:', joinError);
                setCallError(`Failed to join video call: ${joinError.message}`);
                setIsJoiningCall(false);
                return;
            }

            setAgoraClient(client);

            // Set up event handlers
            client.on('user-published', async (user, mediaType) => {
                try {
                    console.log(`Remote user ${user.uid} published ${mediaType}`);
                    await client.subscribe(user, mediaType);
                    console.log(`Subscribed to ${user.uid} ${mediaType}`);
                    
                    if (mediaType === 'video') {
                        setRemoteUsers(prev => {
                            const exists = prev.find(u => u.uid === user.uid);
                            if (!exists) {
                                return [...prev, { 
                                    uid: user.uid, 
                                    videoTrack: user.videoTrack,
                                    audioTrack: user.audioTrack,
                                    hasVideo: true,
                                    hasAudio: !!user.audioTrack
                                }];
                            }
                            return prev.map(u => 
                                u.uid === user.uid 
                                    ? { ...u, videoTrack: user.videoTrack, hasVideo: true }
                                    : u
                            );
                        });

                        // Play video with delay
                        setTimeout(() => {
                            const container = remoteVideoRefs.current[user.uid];
                            if (container && user.videoTrack) {
                                try {
                                    user.videoTrack.play(container);
                                    console.log('✓ Playing remote video for UID:', user.uid);
                                } catch (playError) {
                                    console.error('Failed to play remote video:', playError);
                                }
                            }
                        }, 100);
                    }
                    
                    if (mediaType === 'audio' && user.audioTrack) {
                        try {
                            user.audioTrack.play();
                            console.log('✓ Playing remote audio for UID:', user.uid);
                        } catch (audioPlayError) {
                            console.error('Failed to play remote audio:', audioPlayError);
                        }
                    }
                } catch (subscribeError) {
                    console.error('Failed to subscribe to user:', subscribeError);
                }
            });

            client.on('user-unpublished', (user, mediaType) => {
                console.log(`Remote user ${user.uid} unpublished ${mediaType}`);
                if (mediaType === 'video') {
                    setRemoteUsers(prev => prev.map(u => 
                        u.uid === user.uid 
                            ? { ...u, videoTrack: null, hasVideo: false }
                            : u
                    ));
                }
            });

            client.on('user-left', (user) => {
                console.log('Remote user left:', user.uid);
                setRemoteUsers(prev => prev.filter(u => u.uid !== user.uid));
            });

            client.on('connection-state-change', (curState, prevState) => {
                console.log('Connection state:', prevState, '->', curState);
                if (curState === 'DISCONNECTED') {
                    console.log('Disconnected from channel');
                    setCallError('Connection lost. Please rejoin the call.');
                }
            });

            // Create and publish local tracks
            try {
                const tracksToPublish = [];

                // Create microphone track
                if (hasMicrophoneAccess) {
                    try {
                        const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack({
                            AEC: true,
                            ANS: true,
                            AGC: true
                        }).catch(async (error) => {
                            console.warn('Failed with advanced settings, trying basic audio:', error);
                            return await AgoraRTC.createMicrophoneAudioTrack();
                        });
                        setLocalAudioTrack(microphoneTrack);
                        tracksToPublish.push(microphoneTrack);
                        console.log('✓ Microphone track created');
                    } catch (audioError) {
                        console.error('Failed to create microphone track:', audioError);
                        if (audioError.name === 'NotReadableError') {
                            setCallWarning('Microphone is in use. Continuing without audio.');
                        } else {
                            setCallWarning('Microphone access failed. Continuing without audio.');
                        }
                        setHasMicrophoneAccess(false);
                    }
                }

                // Create camera track
                if (hasCameraAccess) {
                    try {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        const cameraTrack = await AgoraRTC.createCameraVideoTrack({
                            encoderConfig: { 
                                width: { ideal: 640 }, 
                                height: { ideal: 480 }, 
                                frameRate: { ideal: 15 }
                            },
                            optimizationMode: 'motion'
                        }).catch(async (error) => {
                            console.warn('Failed with ideal settings, trying basic video:', error);
                            return await AgoraRTC.createCameraVideoTrack();
                        });
                        
                        setLocalVideoTrack(cameraTrack);
                        tracksToPublish.push(cameraTrack);
                        console.log('✓ Camera track created');
                        
                        // Play local video
                        setTimeout(() => {
                            if (localVideoRef.current && cameraTrack) {
                                try {
                                    cameraTrack.play(localVideoRef.current);
                                    console.log('✓ Local video playing');
                                } catch (playError) {
                                    console.error('Failed to play local video:', playError);
                                }
                            }
                        }, 300);
                    } catch (videoError) {
                        console.error('Failed to create camera track:', videoError);
                        if (videoError.name === 'NotReadableError') {
                            setCallWarning('Camera is in use. Continuing without video.');
                        } else if (videoError.name === 'NotAllowedError') {
                            setCallWarning('Camera permission denied. Continuing without video.');
                        } else {
                            setCallWarning('Camera access failed. Continuing without video.');
                        }
                        setHasCameraAccess(false);
                    }
                }

                // Publish tracks
                if (tracksToPublish.length > 0) {
                    console.log(`Publishing ${tracksToPublish.length} track(s)...`);
                    await client.publish(tracksToPublish);
                    console.log('✓ Successfully published tracks');
                } else {
                    console.warn('No tracks available to publish');
                    setCallWarning('Unable to access camera or microphone. You can still receive audio/video.');
                }

                setIsInCall(true);
                setIsJoiningCall(false);
                setCallError(null);
                console.log('=== Successfully Joined Call ===');
                
            } catch (trackError) {
                console.error('Failed to create/publish tracks:', trackError);
                
                cleanupMediaTracks();
                
                if (client) {
                    await client.leave();
                    setAgoraClient(null);
                }
                
                let errorMessage = 'Failed to setup media devices. ';
                if (trackError.name === 'NotReadableError') {
                    errorMessage += 'Camera or microphone is already in use. Please close other applications and try again.';
                } else if (trackError.message?.includes('No permission')) {
                    errorMessage += 'Camera/microphone permission denied. Please allow access in your browser settings.';
                } else {
                    errorMessage += `Error: ${trackError.message || 'Unknown error'}`;
                }
                
                setCallError(errorMessage);
                setIsJoiningCall(false);
            }

        } catch (error) {
            console.error('Failed to join Agora call:', error);
            setCallError(`Failed to join video call: ${error.message}`);
            setIsJoiningCall(false);
            cleanupMediaTracks();
        }
    };

    // Leave Agora call
    const leaveAgoraCall = async () => {
        try {
            console.log('Leaving call...');
            
            cleanupMediaTracks();
            
            if (agoraClient) {
                try {
                    agoraClient.removeAllListeners();
                    await agoraClient.leave();
                    console.log('Left Agora channel');
                } catch (leaveError) {
                    console.error('Error leaving channel:', leaveError);
                }
                setAgoraClient(null);
            }
            
            // Reset state
            setRemoteUsers([]);
            remoteVideoRefs.current = {};
            setActiveCallData(null);
            setIsInCall(false);
            setIsAudioMuted(false);
            setIsVideoMuted(false);
            setCallError(null);
            setCallWarning(null);
            setHasCameraAccess(true);
            setHasMicrophoneAccess(true);
            
        } catch (error) {
            console.error('Error leaving call:', error);
            setCallError('Failed to leave call properly');
        }
    };

    const toggleAudio = () => {
        if (localAudioTrack) {
            localAudioTrack.setEnabled(!isAudioMuted);
            setIsAudioMuted(!isAudioMuted);
        }
    };

    const toggleVideo = () => {
        if (localVideoTrack) {
            localVideoTrack.setEnabled(!isVideoMuted);
            setIsVideoMuted(!isVideoMuted);
        }
    };

    // Initialize socket connection
    useEffect(() => {
        if (socketInitialized.current) return;

        const initSocket = async () => {
            try {
                const authData = JSON.parse(localStorage.getItem("persist:auth") || '{}');
                const token = authData.token ? JSON.parse(authData.token) : null;
                
                if (!token) {
                    navigate('/login');
                    return;
                }

                setLoading(prev => ({ ...prev, socketConnection: true }));
                await initializeSocket(token);
                socketInitialized.current = true;
                setLoading(prev => ({ ...prev, socketConnection: false }));
            } catch (error) {
                console.error('Socket initialization failed:', error);
                setError('Failed to connect. Please refresh the page.');
                setLoading(prev => ({ 
                    ...prev, 
                    socketConnection: false, 
                    initial: false 
                }));
            }
        };

        initSocket();

        return () => {
            const socket = getSocket();
            if (socket) {
                socket.off("message-user");
                socket.off("message");
                socket.off("new-message");
                socket.off("error");
                socket.off("user-typing");
                socket.off("conversation-status");
                socket.off("user-status");
                socket.off("message-seen");
            }
            leaveAgoraCall();
        };
    }, [navigate]);

    // Socket event listeners and data loading
    useEffect(() => {
        const socket = getSocket();
        if (!socket || !currentUserId || !isSocketConnected) return;

        const receiverId = localStorage.getItem("receiverId");
        const savedConversation = localStorage.getItem("currentConversation");
       
        if (!receiverId && !savedConversation) {
            console.error('No receiverId found');
            setError('Please select a conversation first');
            setLoading(prev => ({ ...prev, initial: false }));
            return;
        }

        if (savedConversation) {
            try {
                const conversation = JSON.parse(savedConversation);
                const otherUser = conversation.sender._id === currentUserId 
                    ? conversation.receiver 
                    : conversation.sender;
                
                setReceiver({
                    fullName: otherUser.fullName || "Unknown User",
                    profileImage: otherUser.profileImage || "",
                    online: false,
                    _id: otherUser._id || receiverId
                });
                setConversation(conversation);
                if (conversation.status) {
                    setConversationStatus(conversation.status);
                }
                if (conversation._id) {
                    setConversationId(conversation._id);
                }
            } catch (e) {
                console.error('Failed to parse saved conversation', e);
            }
        }

        const handleMessageUser = (data) => {
            setReceiver(prev => ({
                ...prev,
                ...data,
                fullName: data.fullName || prev.fullName,
                profileImage: data.profileImage || prev.profileImage,
                _id: data._id || prev._id
            }));
            localStorage.setItem("receiverId", data._id);
        };

        const handleMessage = (data) => {
            setMessages(Array.isArray(data) ? data : []);
            setLoading(prev => ({ ...prev, messages: false, initial: false }));
            scrollToBottom();
            markMessagesAsSeen();
        };

        const handleNewMessage = (newMessage) => {
            console.log('New message received:', newMessage);
            setMessages(prev => {
                const filteredMessages = prev.filter(msg => 
                    !msg.isTemporary || msg._id !== `temp_${newMessage.tempId}`
                );
                return [...filteredMessages, newMessage];
            });
            
            // Check for video call invitation
            if (newMessage.type === 'link' && (newMessage.agoraData || newMessage.zoomJoinUrl || newMessage.zoomHostStartUrl)) {
                if (newMessage.msgByUserId !== currentUserId) {
                    console.log('Showing call invitation for message:', newMessage);
                    setShowCallInvitation(newMessage);
                }
            }
            
            scrollToBottom();
            if (newMessage.msgByUserId !== currentUserId) {
                markMessagesAsSeen();
            }
        };

        const handleError = (error) => {
            setError(error.message || 'Connection error occurred');
            setLoading(prev => ({ ...prev, messages: false, initial: false }));
        };

        const handleUserTyping = (data) => {
            if (data.userId === receiver._id) {
                setIsTyping(data.isTyping);
            }
        };

        const handleConversationStatus = (data) => {
            if (data.conversationId === conversationId) {
                setConversationStatus(data.status);
            }
        };

        const handleUserStatus = (data) => {
            if (data.userId === receiver._id) {
                setReceiver(prev => ({
                    ...prev,
                    online: data.online
                }));
            }
        };

        const handleMessageSeen = ({ conversationId, messageIds }) => {
            setMessages(prev => prev.map(msg => 
                messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
            ));
        };

        socket.on("message-user", handleMessageUser);
        socket.on("message", handleMessage);
        socket.on("new-message", handleNewMessage);
        socket.on("error", handleError);
        socket.on("user-typing", handleUserTyping);
        socket.on("conversation-status", handleConversationStatus);
        socket.on("user-status", handleUserStatus);
        socket.on("message-seen", handleMessageSeen);
        
        socket.emit("message-page", { 
            receiver: receiverId,
            appointmentId
        }, (response) => {
            if (response && !response.success) {
                setError(response.error.message || 'Failed to load messages');
                setLoading(prev => ({ ...prev, initial: false }));
            }
        });

        return () => {
            socket.off("message-user", handleMessageUser);
            socket.off("message", handleMessage);
            socket.off("new-message", handleNewMessage);
            socket.off("error", handleError);
            socket.off("user-typing", handleUserTyping);
            socket.off("conversation-status", handleConversationStatus);
            socket.off("user-status", handleUserStatus);
            socket.off("message-seen", handleMessageSeen);
        };
    }, [currentUserId, appointmentId, isSocketConnected, navigate, conversationId, receiver._id]);

    const toggleConversationStatus = async () => {
        const socket = getSocket();
        if (!socket || !conversationId) return;

        try {
            socket.emit("status", { conversationId }, (response) => {
                if (response?.success) {
                    setConversationStatus(response.status);
                } else {
                    setError(response?.error?.message || "Failed to update conversation status");
                }
            });
        } catch (error) {
            setError("Failed to update conversation status");
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const markMessagesAsSeen = () => {
        const socket = getSocket();
        if (!socket || !receiver?._id || !conversationId) return;

        const unreadMessages = filteredMessages.filter(
            msg => msg.msgByUserId === receiver._id && !msg.seen
        );

        if (unreadMessages.length === 0) return;

        const messageIds = unreadMessages.map(msg => msg._id);
        
        socket.emit("mark-seen", {
            conversationId,
            messageIds
        });

        setMessages(prev => prev.map(msg => 
            messageIds.includes(msg._id) ? { ...msg, seen: true } : msg
        ));
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        const socket = getSocket();
        if (!messageInput.trim() || !socket || !isSocketConnected || !receiver?._id) {
            return;
        }

        if (conversationStatus === "inactive" && userRole !== "superAdmin") {
            setError("You cannot send messages in an inactive conversation");
            return;
        }

        const messagePayload = {
            sender: currentUserId,
            receiver: receiver._id,
            appointmentId,
            text: messageInput,
            msgByUserId: currentUserId,
            type: "text",
            conversationId: conversationId
        };

        const tempId = `temp_${Date.now()}`;
        const tempMessage = {
            _id: tempId,
            text: messageInput,
            msgByUserId: currentUserId,
            createdAt: new Date().toISOString(),
            seen: false,
            isTemporary: true,
            conversationId: conversationId
        };

        setMessages(prev => [...prev, tempMessage]);
        setMessageInput("");
        scrollToBottom();
        
        try {
            socket.emit('new-message', messagePayload, (ack) => {
                if (!ack?.success) {
                    setMessages(prev => prev.filter(msg => msg._id !== tempId));
                    setError(ack?.error?.message || "Failed to send message. Please try again.");
                }
            });
        } catch (error) {
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            setError("Failed to send message. Please try again.");
        }
    };

    const handleArrangeConsultation = async () => {
        const socket = getSocket();
        if (!socket || !isSocketConnected || !receiver?._id) {
            setError("Connection error. Please try again.");
            return;
        }

        if (conversationStatus === "inactive" && userRole !== "superAdmin") {
            setError("You cannot send messages in an inactive conversation");
            return;
        }

        if (!appointmentId) {
            setError("Please select an appointment first");
            return;
        }

        setIsSendingCallLink(true);

        try {
            const messagePayload = {
                sender: currentUserId,
                receiver: receiver._id,
                appointmentId,
                msgByUserId: currentUserId,
                type: "link",
                conversationId: conversationId
            };

            const tempId = `temp_${Date.now()}`;
            const tempMessage = {
                _id: tempId,
                text: "📞 Creating video call link...",
                msgByUserId: currentUserId,
                createdAt: new Date().toISOString(),
                seen: false,
                isTemporary: true,
                type: "link",
                conversationId: conversationId
            };

            setMessages(prev => [...prev, tempMessage]);
            scrollToBottom();

            socket.emit('new-message', messagePayload, (ack) => {
                setIsSendingCallLink(false);
                if (!ack?.success) {
                    setMessages(prev => prev.filter(msg => msg._id !== tempId));
                    setError(ack?.error?.message || "Failed to create video call. Please try again.");
                }
            });
        } catch (error) {
            setIsSendingCallLink(false);
            setError("Failed to create video call. Please try again.");
        }
    };

    const handleRetry = () => {
        setError(null);
        setLoading({
            initial: true,
            messages: true,
            socketConnection: true
        });
        socketInitialized.current = false;
        window.location.reload();
    };

    const receiverImage = receiver.profileImage
        ? `${BASE_URL}${receiver.profileImage}`
        : "/uploads/user.png";

    if (error && !loading.initial) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="text-red-500 text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    if (loading.initial) {
        return (
            <div className="flex h-screen items-center justify-center bg-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                    <p className="text-gray-600">
                        {loading.socketConnection ? 'Connecting...' : 'Loading messages...'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen w-full bg-white">
            {/* Video Call Modal */}
            {isInCall && (
                <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
                    {callError && (
                        <div className="bg-red-500 text-white p-4 text-center">
                            <FiAlertCircle className="inline mr-2" />
                            {callError}
                            <button 
                                onClick={() => setCallError(null)}
                                className="ml-4 text-white underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                    
                    {callWarning && (
                        <div className="bg-yellow-500 text-white p-4 text-center">
                            <FiAlertCircle className="inline mr-2" />
                            {callWarning}
                            <button 
                                onClick={() => setCallWarning(null)}
                                className="ml-4 text-white underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                    
                    {/* Video Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                        {/* Local Video */}
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
                            {localVideoTrack && !isVideoMuted ? (
                                <div 
                                    ref={localVideoRef} 
                                    className="w-full h-full"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center text-white">
                                        <FiCameraOff size={64} className="mx-auto mb-2" />
                                        <p>{isVideoMuted ? 'Camera off' : 'Camera not available'}</p>
                                    </div>
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                                You {isAudioMuted && '🔇'} {isVideoMuted && '📷'}
                                {!hasCameraAccess && ' (No camera)'}
                                {!hasMicrophoneAccess && ' (No mic)'}
                            </div>
                        </div>

                        {/* Remote Videos */}
                        <div className="grid grid-cols-1 gap-4">
                            {remoteUsers.length > 0 ? (
                                remoteUsers.map((user) => (
                                    <div key={user.uid} className="relative bg-gray-900 rounded-lg overflow-hidden">
                                        {user.hasVideo && user.videoTrack ? (
                                            <div 
                                                ref={(el) => {
                                                    if (!el) return;
                                                    remoteVideoRefs.current[user.uid] = el;
                                                    try {
                                                        user.videoTrack.play(el);
                                                    } catch (playError) {
                                                        console.error('Failed to play remote video on mount:', playError);
                                                    }
                                                }}
                                                className="w-full h-64 md:h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-64 md:h-full">
                                                <div className="text-center text-white">
                                                    <div className="text-4xl mb-2">👤</div>
                                                    <p>{receiver.fullName}</p>
                                                    <p className="text-sm text-gray-400">
                                                        {user.hasAudio ? 'Audio only' : 'Connecting...'}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                                            {receiver.fullName}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-center bg-gray-900 rounded-lg h-64 md:h-full">
                                    <div className="text-center text-white">
                                        <div className="animate-pulse">
                                            <div className="text-4xl mb-2">👤</div>
                                            <p className="text-lg">Waiting for {receiver.fullName} to join...</p>
                                            <p className="text-sm text-gray-400 mt-2">
                                                Channel: {activeCallData?.channelName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Call Controls */}
                    <div className="bg-gray-800 py-4 flex justify-center gap-6">
                        {hasMicrophoneAccess && (
                            <button
                                onClick={toggleAudio}
                                className={`p-4 rounded-full ${isAudioMuted ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-80 transition flex items-center gap-2`}
                                title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
                            >
                                {isAudioMuted ? <FiMicOff className="text-white" /> : <FiMic className="text-white" />}
                                <span className="text-white">{isAudioMuted ? 'Unmute' : 'Mute'}</span>
                            </button>
                        )}
                        
                        {hasCameraAccess && (
                            <button
                                onClick={toggleVideo}
                                className={`p-4 rounded-full ${isVideoMuted ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-80 transition flex items-center gap-2`}
                                title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
                            >
                                {isVideoMuted ? <FiCameraOff className="text-white" /> : <FiCamera className="text-white" />}
                                <span className="text-white">{isVideoMuted ? 'Start Video' : 'Stop Video'}</span>
                            </button>
                        )}
                        
                        <button
                            onClick={leaveAgoraCall}
                            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
                            title="End call"
                        >
                            <FiPhoneOff className="text-white" />
                            <span className="text-white">End Call</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Permission Request Modal */}
            {isRequestingPermissions && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiVideo className="text-blue-600" size={32} />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                Camera & Microphone Access Required
                            </h3>
                            <p className="text-gray-600 text-sm">
                                To start the video call, we need access to your camera and microphone. 
                                Please click <strong>"Allow"</strong> when your browser asks for permission.
                            </p>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <div className="text-blue-600 mt-0.5">ℹ️</div>
                                <div className="text-sm text-blue-900">
                                    <p className="font-medium mb-1">Look for the browser popup</p>
                                    <p className="text-blue-700">
                                        Your browser will show a permission request at the top of the page. 
                                        Make sure to click "Allow" to proceed.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsRequestingPermissions(false);
                                    setCallError('Permission request cancelled');
                                    setIsJoiningCall(false);
                                }}
                                className="px-6 py-2.5 text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition"
                            >
                                Cancel
                            </button>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <p className="text-xs text-gray-500 text-center">
                                Having trouble? Check your browser settings to ensure camera and microphone access is not blocked.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Call Invitation Modal */}
            {showCallInvitation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <FiVideo className="text-blue-500 text-2xl" />
                            <h3 className="text-lg font-semibold">Video Call Invitation</h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6">
                            {receiver.fullName} is inviting you to a video call.
                        </p>
                        
                        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-700">
                                <FiAlertCircle className="inline mr-1" />
                                Please allow camera and microphone permissions when prompted.
                            </p>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowCallInvitation(null)}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => {
                                    const agoraData = showCallInvitation.agoraData || 
                                                     showCallInvitation.zoomHostStartUrl || 
                                                     showCallInvitation.zoomJoinUrl;
                                    console.log('Join call clicked with data:', agoraData);
                                    handleJoinCall(agoraData);
                                }}
                                disabled={isJoiningCall}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isJoiningCall ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        Joining...
                                    </>
                                ) : (
                                    'Join Call'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-white border-b">
                <div className="flex items-center space-x-3">
                    <img
                        src={receiverImage}
                        alt={receiver?.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">{receiver?.fullName}</h3>
                        <p className="text-sm text-gray-500">
                            {receiver.online ? 'Online' : 'Offline'}
                            {isTyping && <span className="text-blue-500 ml-2">typing...</span>}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    {userRole === "superAdmin" && (
                        <button
                            type="button"
                            onClick={toggleConversationStatus}
                            aria-pressed={conversationStatus === "active"}
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                conversationStatus === "active" 
                                    ? "bg-green-500" 
                                    : "bg-gray-300"
                            }`}
                        >
                            <span className="sr-only">Toggle status</span>
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${
                                    conversationStatus === "active" 
                                        ? "translate-x-7" 
                                        : "translate-x-1"
                                }`}
                            />
                        </button>
                    )}
                    {conversation?.appointment?.appointmentId && (
                        <Link 
                            to={`/prescription/${conversation.appointment.appointmentId}`} 
                            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200"
                        >
                            Write Prescription
                        </Link>
                    )}
                    <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200">
                        <FiMoreVertical className="text-gray-600" size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {loading.messages ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                        </svg>
                        <p className="text-lg">No messages yet</p>
                        <p className="text-sm">Start the conversation</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMessages.map((msg) => (
                            <div 
                                key={msg._id} 
                                className={`flex ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex ${msg.msgByUserId === currentUserId ? "flex flex-col justify-end items-end" : "flex flex-col justify-end"}`}>
                                    <div
                                        className={`max-w-xs md:max-w-md p-3 rounded-lg shadow-sm ${
                                            msg.msgByUserId === currentUserId
                                                ? "bg-[#D5EDFF] text-black rounded-br-none"
                                                : "bg-[#EDE9E9] text-black rounded-bl-none"
                                        } ${msg.isTemporary ? 'opacity-70' : ''} ${
                                            !msg.seen && msg.msgByUserId !== currentUserId ? 'border-l-4 border-blue-500' : ''
                                        }`}
                                    >
                                        {msg.type === 'link' ? (
                                            <button
                                                onClick={() => {
                                                    const agoraDataString = msg.agoraData || msg.zoomHostStartUrl || msg.zoomJoinUrl;
                                                    if (agoraDataString) {
                                                        console.log('Joining call from message with data:', agoraDataString);
                                                        handleJoinCall(agoraDataString);
                                                    }
                                                }}
                                                disabled={isJoiningCall}
                                                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <FiVideo size={20} />
                                                {isJoiningCall ? 'Joining...' : 'Join Video Call'}
                                            </button>
                                        ) : (
                                            <p className="text-sm">{msg.text}</p>
                                        )}
                                    </div>
                                    <div className="flex flex-row items-center mt-1">
                                        {msg.msgByUserId === currentUserId && (
                                            <span className="text-xs text-gray-500 mr-1">
                                                {msg.seen ? (
                                                    <PiChecks className="text-blue-500" />
                                                ) : (
                                                    <PiChecks className="text-gray-400" />
                                                )}
                                            </span>
                                        )}
                                        <p className="text-xs text-gray-800 px-1">
                                            {msg.msgByUserId === currentUserId ? 'You' : receiver.fullName}
                                        </p>
                                        <p className="text-xs text-[#77C4FE]">
                                            {moment(msg.createdAt).format('h:mm A')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={sendMessage} className="flex items-center w-full">
                    <div className='bg-[#F1F9FF] rounded-full border border-gray-300 px-4 py-2 shadow-sm w-full flex justify-between'>
                        <button type="button" className="text-gray-500 hover:text-blue-500 transition duration-200">
                            <FiSmile size={20} />
                        </button>
                        <input
                            type="text"
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Send your message..."
                            className="flex-1 bg-[#F1F9FF] px-4 py-2 text-[#222222] placeholder-[#222222] focus:outline-none"
                            disabled={!isSocketConnected || !receiver?._id || (conversationStatus === "inactive" && userRole !== "superAdmin")}
                        />
                        <button type="button" className="text-gray-500 hover:text-blue-500 mx-2 transition duration-200">
                            <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M4.00004 11.5571C12.7742 1.88169 14.7628 2.45166 17.8539 5.39632C20.6252 8.03636 21.1384 9.76254 16.8274 14.6365C10.5662 21.6427 8.75355 21.2427 6.58068 19.1955C3.60828 16.3951 4.83082 14.6365 10 9.99998C11.2686 8.86214 12.4517 7.97229 14 9.49998C15.5484 11.0277 15 12 10 17" stroke="#4E4E4E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button> 
                        <button 
                            type="button" 
                            className="h-10 w-15 font-small rounded-md px-2 text-[#FDFDFD] bg-[#77C4FE] disabled:opacity-50"
                            onClick={handleArrangeConsultation}
                            disabled={!isSocketConnected || !receiver?._id || !appointmentId || isSendingCallLink || (conversationStatus === "inactive" && userRole !== "superAdmin")}
                        >
                            {isSendingCallLink ? 'Creating...' : 'Start Video Call'}
                        </button>
                    </div>
                   
                    <button 
                        type="submit"
                        className="bg-[#77C4FE] p-2 m-5 rounded-full hover:bg-blue-600 transition disabled:opacity-50"
                        disabled={!messageInput.trim() || !isSocketConnected || !receiver?._id || (conversationStatus === "inactive" && userRole !== "superAdmin")}
                    >
                        <FiSend className="text-white" size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default MessagePage;
