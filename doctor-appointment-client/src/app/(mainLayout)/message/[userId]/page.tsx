"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { 
  FiImage, FiMoreVertical, FiSmile, FiVideo, 
  FiMic, FiMicOff, FiPhoneOff, FiCamera, 
  FiCameraOff, FiSend, FiMessageSquare, FiAlertCircle
} from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa6";
import { IoEllipsisVertical } from "react-icons/io5";
import AgoraRTC, { 
  IAgoraRTCClient, 
  IAgoraRTCRemoteUser,
  ICameraVideoTrack, 
  ILocalTrack,
  IMicrophoneAudioTrack,
  IRemoteAudioTrack,
  IRemoteVideoTrack,
  UID 
} from 'agora-rtc-sdk-ng';
import { initializeSocket, getSocket } from "../../../../services/socketService";
import { RootState } from "../../../../redux/store";
import Image from "next/image";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import { 
  addMessage, 
  setCurrentConversation,
  setMessages,
  setTyping,
  updateConversationStatus,
  setError as setConversationError,
  setLoading,
  markMessagesAsSeen
} from "@/redux/features/socket/conversationSlice";
import { useCreateAppointmentPaymentMutation } from "@/redux/features/auth/appontmentApi";

// Configure Agora logging
AgoraRTC.setLogLevel(3);

interface Message {
  _id: string;
  text?: string;
  msgByUserId: string;
  createdAt: string;
  seen: boolean;
  isTemporary?: boolean;
  type: 'text' | 'image' | 'video' | 'link' | 'agora_call';
  zoomJoinUrl?: string;
  zoomHostStartUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  consultationLink?: string;
  agoraData?: AgoraCallData | string;
  conversationId?: string;
  appointmentId?: string;
}

interface User {
  _id: string;
  fullName: string;
  profileImage?: string;
  online?: boolean;
  role?: string;
  email?: string;
}

interface Appointment {
  _id: string;
  isPaid: boolean;
  date: string;
  timeSlot: string;
  status: string;
  appointmentId?: string;
}

interface ConversationData {
  _id: string;
  status: 'active' | 'inactive';
  sender: User;
  receiver: User;
  appointmentId: { _id: string } | string;
  appointment?: Appointment;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
}

interface PaymentResponse {
  code: number;
  message: string;
  data: {
    attributes: string;
  };
}

interface LoadingState {
  initial: boolean;
  messages: boolean;
}

interface ConversationState {
  currentConversation: ConversationData | null;
  messages: Message[];
  loading: LoadingState;
  error: string | null;
  isTyping: boolean;
}

interface RemoteUser {
  uid: UID;
  videoTrack?: IRemoteVideoTrack;
  audioTrack?: IRemoteAudioTrack;
  hasVideo: boolean;
  hasAudio: boolean;
}

interface AgoraCallData {
  appId: string;
  channelName: string;
  token: string;
  doctor?: {
    uid: number;
    token: string;
    email: string;
  };
  patient?: {
    uid: number;
    token: string;
    email: string;
  };
  appointment?: {
    id: string;
    topic: string;
    agenda: string;
  };
}

type AgoraDataInput = AgoraCallData | string;

type SocketAck = {
  success?: boolean;
  error?: {
    message?: string;
  };
};

type AuthUser =
  | {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      profileImage: string;
      role?: string;
    }
  | {
      _id: string;
      id?: string;
      email?: string;
      fullName?: string;
      profileImage?: string;
      role?: string;
    };

const getUserId = (user: AuthUser | null | undefined): string | undefined => {
  if (!user) return undefined;
  if ('id' in user && user.id) return user.id;
  if ('_id' in user && user._id) return user._id;
  return undefined;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};

const getErrorName = (error: unknown): string => {
  if (error && typeof error === 'object' && 'name' in error) {
    const name = (error as { name?: unknown }).name;
    if (typeof name === 'string') {
      return name;
    }
  }
  return 'UnknownError';
};

const MessagePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams<{ userId: string }>();
  const appointmentId = params?.userId;
  
  const {
    currentConversation,
    messages,
    loading,
    error: conversationError,
    isTyping
  } = useSelector((state: RootState) => state.conversation as ConversationState);

  const currentUser = useSelector((state: RootState) => state.auth.user) as AuthUser | null;
  const currentUserId = getUserId(currentUser);

  const [messageInput, setMessageInput] = useState("");
  const [receiver, setReceiver] = useState<User>({
    _id: "",
    fullName: "Loading...",
    profileImage: "",
    online: false,
  });
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  
  // Video call states
  const [isInCall, setIsInCall] = useState(false);
  const [activeCallData, setActiveCallData] = useState<AgoraCallData | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [callWarning, setCallWarning] = useState<string | null>(null);
  const [agoraClient, setAgoraClient] = useState<IAgoraRTCClient | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<IMicrophoneAudioTrack | null>(null);
  const [localVideoTrack, setLocalVideoTrack] = useState<ICameraVideoTrack | null>(null);
  const [remoteUsers, setRemoteUsers] = useState<RemoteUser[]>([]);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isJoiningCall, setIsJoiningCall] = useState(false);
  const [showCallInvitation, setShowCallInvitation] = useState<Message | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean>(true);
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(true);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLDivElement>(null);
  const remoteVideoRef = useRef<HTMLDivElement>(null);
  const agoraClientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);

  const [createPayment] = useCreateAppointmentPaymentMutation();

  // Memoized filtered messages
  const filteredMessages = useMemo(() => {
    if (!currentConversation?._id || !messages) return [];
    
    return messages.filter(msg => 
      msg.conversationId === currentConversation._id ||
      !msg.conversationId
    ).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, currentConversation]);

  // Calculate time remaining for inactive conversations
  const calculateTimeRemaining = useCallback(() => {
    if (!currentConversation?.appointment?.date || !currentConversation?.appointment?.timeSlot) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const appointmentDateTime = moment(
      `${currentConversation.appointment.date} ${currentConversation.appointment.timeSlot}`,
      "YYYY-MM-DD HH:mm A"
    );
    
    const now = moment();
    
    if (now.isAfter(appointmentDateTime)) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    
    const duration = moment.duration(appointmentDateTime.diff(now));
    
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();
    
    return { days, hours, minutes, seconds };
  }, [currentConversation?.appointment?.date, currentConversation?.appointment?.timeSlot]);

  // Check if appointment has passed
  const isAppointmentPassed = useMemo(() => {
    if (!currentConversation?.appointment?.date || !currentConversation?.appointment?.timeSlot) {
      return false;
    }
    
    const appointmentDateTime = moment(
      `${currentConversation.appointment.date} ${currentConversation.appointment.timeSlot}`,
      "YYYY-MM-DD HH:mm A"
    );
    
    return moment().isAfter(appointmentDateTime);
  }, [currentConversation?.appointment?.date, currentConversation?.appointment?.timeSlot]);

  // Check camera access
  const checkCameraAccess = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasCameraAccess(true);
      return true;
    } catch (error: unknown) {
      console.warn('Camera access failed:', getErrorName(error));
      setHasCameraAccess(false);
      return false;
    }
  };

  // Check microphone access
  const checkMicrophoneAccess = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophoneAccess(true);
      return true;
    } catch (error: unknown) {
      console.warn('Microphone access failed:', getErrorName(error));
      setHasMicrophoneAccess(false);
      return false;
    }
  };

  // Clean up media tracks
  const cleanupMediaTracks = useCallback(() => {
    console.log('Cleaning up media tracks...');
    
    if (localAudioTrackRef.current) {
      try {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
      } catch (e) {
        console.error('Error closing audio track:', e);
      }
      localAudioTrackRef.current = null;
      setLocalAudioTrack(null);
    }
    
    if (localVideoTrackRef.current) {
      try {
        localVideoTrackRef.current.stop();
        localVideoTrackRef.current.close();
      } catch (e) {
        console.error('Error closing video track:', e);
      }
      localVideoTrackRef.current = null;
      setLocalVideoTrack(null);
    }
  }, []);

  // FIXED: Join Agora call - PATIENT ONLY
  const handleJoinCall = async (agoraData: AgoraDataInput) => {
    try {
      if (isJoiningCall) return;
      // Ensure any previous client is fully cleaned up before joining again
      if (agoraClientRef.current) {
        try {
          await agoraClientRef.current.leave();
        } catch (leaveError) {
          console.warn('Error leaving previous Agora session:', leaveError);
        }
        agoraClientRef.current = null;
        setAgoraClient(null);
        cleanupMediaTracks();
        setIsInCall(false);
      }

      setIsJoiningCall(true);
      console.log('=== PATIENT: Joining Video Call ===');
      setCallError(null);
      setCallWarning(null);

      // Parse Agora data
      let parsedAgoraData: AgoraCallData;
      try {
        parsedAgoraData = typeof agoraData === 'string' ? JSON.parse(agoraData) : agoraData;
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

      // Check patient credentials
      if (!parsedAgoraData.patient?.token || parsedAgoraData.patient?.uid === undefined || parsedAgoraData.patient?.uid === null) {
        console.error('Missing patient credentials:', parsedAgoraData.patient);
        setCallError('Missing video call credentials. Please contact support.');
        setIsJoiningCall(false);
        return;
      }

      const patientUid = parsedAgoraData.patient.uid;
      const joinUid = patientUid;

      console.log('Using patient credentials:', {
        uid: patientUid,
        joinUid,
        tokenPresent: !!parsedAgoraData.patient.token
      });

      // Show call UI immediately so the user sees the call screen during join
      setActiveCallData(parsedAgoraData);
      setShowCallInvitation(null);
      setIsInCall(true);

      // Check device access
      const cameraAccess = await checkCameraAccess();
      const microphoneAccess = await checkMicrophoneAccess();

      if (!cameraAccess && !microphoneAccess) {
        setCallWarning('Camera and microphone not available. You can still join to see and hear the doctor.');
      }

      // Initialize Agora client
      const client = AgoraRTC.createClient({ 
        mode: 'rtc', 
        codec: 'vp8' 
      });

      // Join the channel with PATIENT credentials
      try {
        console.log('Joining channel...', {
          appId: parsedAgoraData.appId,
          channel: parsedAgoraData.channelName,
          uid: joinUid
        });
        
        await client.join(
          parsedAgoraData.appId,
          parsedAgoraData.channelName,
          parsedAgoraData.patient.token,
          joinUid as UID
        );
        console.log('✓ Successfully joined channel');
      } catch (joinError: unknown) {
        console.error('Failed to join channel:', joinError);
        setCallError(`Failed to join: ${getErrorMessage(joinError)}`);
        setIsJoiningCall(false);
        setIsInCall(false);
        cleanupMediaTracks();
        return;
      }

      setAgoraClient(client);
      agoraClientRef.current = client;

      // Set up event handlers for remote user (doctor)
      client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        try {
          console.log(`Remote user ${user.uid} published ${mediaType}`);
          await client.subscribe(user, mediaType);
          
          if (mediaType === 'video') {
            setRemoteUsers([{ 
              uid: user.uid, 
              videoTrack: user.videoTrack,
              audioTrack: user.audioTrack,
              hasVideo: true,
              hasAudio: !!user.audioTrack
            }]);

            // Play remote video
            setTimeout(() => {
              if (remoteVideoRef.current && user.videoTrack) {
                user.videoTrack.play(remoteVideoRef.current);
              }
            }, 100);
          }
          
          if (mediaType === 'audio' && user.audioTrack) {
            user.audioTrack.play();
          }
        } catch (error: unknown) {
          console.error('Failed to subscribe:', error);
        }
      });

      client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
        console.log('Remote user unpublished:', user.uid);
        setRemoteUsers([]);
      });

      client.on('user-left', (user: IAgoraRTCRemoteUser) => {
        console.log('Remote user left:', user.uid);
        setRemoteUsers([]);
      });

      // Create and publish local tracks
      const tracksToPublish: ILocalTrack[] = [];

      // Track creation only when the check above succeeded
      if (microphoneAccess) {
        try {
          console.log('Creating microphone track...');
          const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack({
            AEC: true,
            ANS: true,
            AGC: true
          }).catch(async (error) => {
            console.warn('Failed with advanced audio settings, trying basic:', error);
            return await AgoraRTC.createMicrophoneAudioTrack();
          });
          localAudioTrackRef.current = microphoneTrack;
          setLocalAudioTrack(microphoneTrack);
          tracksToPublish.push(microphoneTrack);
          console.log('✓ Microphone track created');
        } catch (audioError: unknown) {
          console.warn('Failed to create microphone track:', audioError);
          setHasMicrophoneAccess(false);
          setCallWarning('Microphone not available. Continuing without audio.');
        }
      }

      // Create camera track with a short delay to avoid device busy errors
      if (cameraAccess) {
        try {
          console.log('Creating camera track...');
          await new Promise(resolve => setTimeout(resolve, 500));

          const devices = await navigator.mediaDevices.enumerateDevices();
          const cameras = devices.filter(device => device.kind === 'videoinput');
          const selectedCamera = cameras[0];

          if (!selectedCamera) {
            setHasCameraAccess(false);
            setCallWarning('No camera device found. Continuing without video.');
            throw new Error('No camera device found');
          }

          const cameraTrack = await AgoraRTC.createCameraVideoTrack({
            cameraId: selectedCamera.deviceId,
            encoderConfig: {
              width: { ideal: 640 },
              height: { ideal: 480 },
              frameRate: { ideal: 15 }
            },
            optimizationMode: 'motion'
          }).catch(async (error) => {
            console.warn('Failed with ideal video settings, trying basic:', error);
            return await AgoraRTC.createCameraVideoTrack({
              cameraId: selectedCamera.deviceId
            });
          });

          localVideoTrackRef.current = cameraTrack;
          setLocalVideoTrack(cameraTrack);
          tracksToPublish.push(cameraTrack);
          console.log('✓ Camera track created');
          
          // Play local video
          setTimeout(() => {
            if (localVideoRef.current && cameraTrack) {
              cameraTrack.play(localVideoRef.current);
              console.log('✓ Local video playing');
            }
          }, 300);
          
        } catch (videoError: unknown) {
          console.error('Failed to create camera track:', videoError);
          setHasCameraAccess(false);
          setCallWarning('Camera not available. Continuing without video.');
        }
      }

      // Publish tracks
      if (tracksToPublish.length > 0) {
        try {
          const waitForConnected = async () => {
            for (let attempt = 0; attempt < 10; attempt++) {
              if (client.connectionState === 'CONNECTED') {
                return true;
              }
              await new Promise(resolve => setTimeout(resolve, 100));
            }
            return false;
          };

          const isConnected = await waitForConnected();
          if (!isConnected) {
            console.warn('Publish skipped: client not connected yet');
          } else {
            await client.publish(tracksToPublish);
            console.log('✓ Published local tracks');
          }
        } catch (publishError) {
          console.error('Failed to publish tracks:', publishError);
        }
      }

      setIsJoiningCall(false);
      console.log('✓ Patient successfully joined call');
      
    } catch (error: unknown) {
      console.error('Join call failed:', error);
      setCallError(`Failed to join call: ${getErrorMessage(error) || 'Unknown error'}`);
      setIsJoiningCall(false);
      cleanupMediaTracks();
      setIsInCall(false);
    }
  };

  // Leave call
  const handleLeaveCall = async () => {
    try {
      console.log('Leaving call...');
      
      cleanupMediaTracks();
      
      if (agoraClient) {
        try {
          await agoraClient.leave();
          console.log('✓ Left channel');
        } catch (leaveError) {
          console.error('Error leaving:', leaveError);
        }
        setAgoraClient(null);
        agoraClientRef.current = null;
      }
      
      setIsInCall(false);
      setActiveCallData(null);
      setRemoteUsers([]);
      setCallError(null);
      setCallWarning(null);
      setIsAudioMuted(false);
      setIsVideoMuted(false);
      
    } catch (error) {
      console.error('Error leaving call:', error);
      setIsInCall(false);
      cleanupMediaTracks();
    }
  };

  // Toggle audio
  const toggleAudio = async () => {
    if (localAudioTrack) {
      try {
        await localAudioTrack.setEnabled(!isAudioMuted);
        setIsAudioMuted(!isAudioMuted);
        console.log(`Audio ${!isAudioMuted ? 'muted' : 'unmuted'}`);
      } catch (error) {
        console.error('Failed to toggle audio:', error);
      }
    }
  };

  // Toggle video
  const toggleVideo = async () => {
    if (localVideoTrack) {
      try {
        await localVideoTrack.setEnabled(!isVideoMuted);
        setIsVideoMuted(!isVideoMuted);
        console.log(`Video ${!isVideoMuted ? 'muted' : 'unmuted'}`);
      } catch (error) {
        console.error('Failed to toggle video:', error);
      }
    }
  };

  // Handle video call button click
  const handleVideoCallClick = async () => {
    if (!currentConversation || !currentUserId || !receiver?._id) {
      dispatch(setConversationError("Cannot start video call: Missing conversation data"));
      return;
    }

    try {
      const socket = getSocket();
      if (!socket) {
        dispatch(setConversationError("Socket connection not available"));
        return;
      }

      // Send request
      const messagePayload = {
        sender: currentUserId,
        receiver: receiver._id,
        appointmentId: typeof currentConversation.appointmentId === 'string' ? 
          currentConversation.appointmentId : 
          currentConversation.appointmentId?._id || appointmentId,
        msgByUserId: currentUserId,
        type: "link",
        conversationId: currentConversation._id
      };

      socket.emit("new-message", messagePayload, (ack: SocketAck) => {
        if (!ack?.success) {
          dispatch(setConversationError(ack?.error?.message || "Failed to create video call"));
        }
      });

    } catch (error) {
      console.error('Failed to initiate video call:', error);
      dispatch(setConversationError("Failed to initiate video call"));
    }
  };

  // Timer for inactive conversations
  useEffect(() => {
    if (currentConversation?.status === 'inactive') {
      setTimeRemaining(calculateTimeRemaining());
      
      timeIntervalRef.current = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 1000);

      return () => {
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
        }
      };
    }
  }, [currentConversation?.status, calculateTimeRemaining]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

  // Mark messages as seen
  const handleMarkAsSeen = useCallback(() => {
    if (!currentConversation?._id || !currentUserId || !receiver?._id) return;

    const unreadMessages = filteredMessages.filter(
      msg => msg.msgByUserId === receiver._id && !msg.seen
    );

    if (unreadMessages.length === 0) return;

    const socket = getSocket();
    if (!socket) return;

    socket.emit("mark-seen", {
      conversationId: currentConversation._id,
      messageIds: unreadMessages.map(msg => msg._id)
    });

    dispatch(markMessagesAsSeen({
      conversationId: currentConversation._id,
      userId: currentUserId
    }));
  }, [currentConversation?._id, currentUserId, dispatch, filteredMessages, receiver?._id]);

  // Auto scroll and mark as seen
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
      
      if (isAtBottom) {
        handleMarkAsSeen();
      }
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [handleMarkAsSeen]);

  // Auto scroll on new messages
  useEffect(() => {
    if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
    
    seenTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => {
      if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
    };
  }, [filteredMessages, scrollToBottom]);

  // Handle typing
  const handleTyping = useCallback(() => {
    if (currentConversation?.status === 'inactive') return;
    
    const socket = getSocket();
    if (!socket || !receiver?._id) return;
    
    socket.emit("typing", { receiverId: receiver._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => dispatch(setTyping(false)), 2000);
  }, [receiver?._id, currentConversation?.status, dispatch]);

  // Handle payment
  const handlePayment = async () => {
    try {
      setIsPaymentLoading(true);
      
      const paymentAppointmentId = currentConversation?.appointment?.appointmentId;

      if (!paymentAppointmentId) {
        dispatch(setConversationError("No appointment ID found"));
        return;
      }

      const paymentData = {
        appointmentId: paymentAppointmentId,
        amount: "9.99",
      };

      const result = await createPayment(paymentData).unwrap() as PaymentResponse;

      if (result?.code === 200 && result?.data?.attributes) {
        window.location.href = result.data.attributes;
      } else {
        dispatch(setConversationError("Payment successful but no redirect URL provided"));
      }
    } catch (error: unknown) {
      console.error('Payment failed:', error);
      dispatch(setConversationError("Payment failed. Please try again."));
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Send message
  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentConversation?.status === 'inactive') {
      dispatch(setConversationError("This conversation is inactive. You cannot send messages."));
      return;
    }

    const socket = getSocket();
    if (!messageInput.trim() || !socket || !currentUserId || !receiver?._id || !currentConversation) {
      return;
    }

    const tempId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      text: messageInput,
      msgByUserId: currentUserId,
      createdAt: new Date().toISOString(),
      seen: false,
      isTemporary: true,
      type: 'text',
      conversationId: currentConversation._id,
      appointmentId: typeof currentConversation.appointmentId === 'string' ? 
        currentConversation.appointmentId : 
        currentConversation.appointmentId?._id || undefined
    };

    dispatch(addMessage(tempMessage));
    setMessageInput("");
    
    if (inputRef.current) inputRef.current.focus();

    try {
      const messagePayload = {
        sender: currentUserId,
        receiver: receiver._id,
        appointmentId: typeof currentConversation.appointmentId === 'string' ? 
          currentConversation.appointmentId : 
          currentConversation.appointmentId?._id || appointmentId,
        text: messageInput,
        msgByUserId: currentUserId,
        type: "text" as const,
        conversationId: currentConversation._id
      };

      socket.emit("new-message", messagePayload, (ack: { success?: boolean; error?: { message: string } }) => {
        if (!ack?.success) {
          dispatch(setMessages(messages.filter(msg => msg._id !== tempId)));
          dispatch(setConversationError(ack?.error?.message || "Failed to send message"));
        }
      });
    } catch (error: unknown) {
      console.error('Failed to send message:', error);
      dispatch(setMessages(messages.filter(msg => msg._id !== tempId)));
      dispatch(setConversationError("Failed to send message"));
    }
  }, [messageInput, currentUserId, receiver?._id, currentConversation, dispatch, messages, appointmentId]);

  // Handle key down
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
    handleTyping();
  }, [sendMessage, handleTyping]);

  // Initialize socket and listeners
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    const initSocket = async () => {
      try {
        if (!socketInitialized.current) {
          await initializeSocket(token);
          socketInitialized.current = true;
        }

        const socket = getSocket();
        if (!socket || !currentUserId) return;

        const receiverId = localStorage.getItem("receiverId");
        if (!receiverId) {
          dispatch(setConversationError("Receiver ID not found"));
          return;
        }

        // Socket event handlers
        const handleStatusUpdate = (updatedConversation: ConversationData) => {
          if (updatedConversation._id === currentConversation?._id) {
            dispatch(updateConversationStatus({
              conversationId: updatedConversation._id,
              status: updatedConversation.status
            }));
          }
        };

        const handleUserStatus = ({ userId, online }: { userId: string; online: boolean }) => {
          if (userId === receiverId) {
            setReceiver(prev => ({ ...prev, online }));
          }
        };

        const handleMessages = (data: Message[]) => {
          const relevantMessages = data.filter(msg => 
            !currentConversation || msg.conversationId === currentConversation._id || !msg.conversationId
          );
          
          dispatch(setMessages(relevantMessages));
          dispatch(setLoading({ initial: false, messages: false }));
        
          const unreadMessages = relevantMessages.filter(
            msg => msg.msgByUserId !== currentUserId && !msg.seen
          );
          
          if (unreadMessages.length > 0 && currentConversation) {
            socket.emit("mark-seen", {
              conversationId: currentConversation._id,
              messageIds: unreadMessages.map(msg => msg._id)
            });
          }
        };

        const handleNewMessage = (newMessage: Message) => {
          console.log('New message received:', newMessage);
          
          if (!currentConversation || newMessage.conversationId === currentConversation._id || !newMessage.conversationId) {
            dispatch(addMessage(newMessage));
            
            // Check for video call invitation
            if (newMessage.type === 'link' && (newMessage.agoraData || newMessage.zoomJoinUrl || newMessage.zoomHostStartUrl)) {
              if (newMessage.msgByUserId !== currentUserId) {
                console.log('Showing call invitation for message:', newMessage);
                setShowCallInvitation(newMessage);
              }
            }
            
            if (newMessage.msgByUserId === receiverId && !newMessage.seen) {
              socket.emit("mark-seen", {
                conversationId: currentConversation?._id,
                messageIds: [newMessage._id]
              });
            }
          }
        };

        const handleTypingEvent = () => {
          dispatch(setTyping(true));
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => dispatch(setTyping(false)), 2000);
        };

        const handleError = (errorData: { message?: string }) => {
          dispatch(setConversationError(errorData.message || "Connection error"));
          dispatch(setLoading({ initial: false, messages: false }));
        };

        const handleConversationData = (data: ConversationData) => {
          if (!data._id) {
            dispatch(setConversationError("Conversation data missing required fields"));
            return;
          }
          
          const normalizedData = {
            ...data,
            appointmentId: typeof data.appointmentId === 'string' 
              ? { _id: data.appointmentId }
              : data.appointmentId
          };
          
          dispatch(setCurrentConversation(normalizedData));
          dispatch(setLoading({ initial: false, messages: false }));
          
          const otherUser = data.sender._id === currentUserId ? data.receiver : data.sender;
          setReceiver({
            _id: otherUser._id,
            fullName: otherUser.fullName,
            profileImage: otherUser.profileImage || "",
            online: otherUser.online || false
          });
        };

        // Register event listeners
        socket.on("conversation-status-updated", handleStatusUpdate);
        socket.on("user-status", handleUserStatus);
        socket.on("message", handleMessages);
        socket.on("new-message", handleNewMessage);
        socket.on("typing", handleTypingEvent);
        socket.on("error", handleError);
        socket.on("conversation-data", handleConversationData);

        // Request conversation data
        socket.emit("message-page", { 
          receiver: receiverId,
          appointmentId
        });

        return () => {
          socket.off("conversation-status-updated", handleStatusUpdate);
          socket.off("user-status", handleUserStatus);
          socket.off("message", handleMessages);
          socket.off("new-message", handleNewMessage);
          socket.off("typing", handleTypingEvent);
          socket.off("error", handleError);
          socket.off("conversation-data", handleConversationData);
        };

      } catch (error: unknown) {
        console.error('Socket connection error:', error);
        dispatch(setConversationError("Failed to connect. Please refresh the page."));
        dispatch(setLoading({ initial: false, messages: false }));
      }
    };

    initSocket();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      if (seenTimeoutRef.current) {
        clearTimeout(seenTimeoutRef.current);
      }
      cleanupMediaTracks();
      if (agoraClientRef.current) {
        try {
          const leavePromise = agoraClientRef.current.leave();
          if (leavePromise && typeof leavePromise.catch === 'function') {
            leavePromise.catch((leaveError: unknown) => {
              console.error('Error leaving on cleanup:', leaveError);
            });
          }
        } catch (leaveError) {
          console.error('Error leaving on cleanup:', leaveError);
        }
        agoraClientRef.current = null;
      }
    };
  }, [currentUserId, appointmentId, router, scrollToBottom, dispatch, currentConversation?._id, cleanupMediaTracks]);

  const handleRetry = useCallback(() => {
    dispatch(setConversationError(null));
    dispatch(setLoading({ initial: true, messages: true }));
    socketInitialized.current = false;
    window.location.reload();
  }, [dispatch]);

  const receiverImage = receiver.profileImage
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${receiver.profileImage}`
    : "/uploads/user.png";

  // Loading state
  if (loading.initial) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">
            {loading.messages ? "Loading messages..." : "Connecting..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (conversationError && !loading.initial) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md p-6 rounded-xl bg-gray-50 shadow-sm">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{conversationError}</p>
          <button
            onClick={handleRetry}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Video call overlay
  if (isInCall) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Error/Warning Messages */}
        {callError && (
          <div className="bg-red-500 text-white p-3 text-center">
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
          <div className="bg-yellow-500 text-white p-3 text-center">
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
          {/* Local Video (Patient) */}
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
            </div>
          </div>

          {/* Remote Video (Doctor) */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            {remoteUsers.length > 0 && remoteUsers[0]?.hasVideo ? (
              <div 
                ref={remoteVideoRef}
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-white">
                  <div className="text-4xl mb-2">👤</div>
                  <p className="text-lg">Waiting for doctor...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Channel: {activeCallData?.channelName}
                  </p>
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              Doctor
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="bg-gray-800 py-4 flex justify-center gap-6">
          {hasMicrophoneAccess && localAudioTrack && (
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full ${isAudioMuted ? 'bg-red-600' : 'bg-gray-700'} hover:opacity-80 transition flex items-center gap-2`}
              title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
            >
              {isAudioMuted ? <FiMicOff className="text-white" /> : <FiMic className="text-white" />}
              <span className="text-white">{isAudioMuted ? 'Unmute' : 'Mute'}</span>
            </button>
          )}
          
          {hasCameraAccess && localVideoTrack && (
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
            onClick={handleLeaveCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition flex items-center gap-2"
            title="End call"
          >
            <FiPhoneOff className="text-white" />
            <span className="text-white">End Call</span>
          </button>
        </div>
      </div>
    );
  }

  // Call invitation modal
  const callInvitationModal = showCallInvitation && (
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
              if (agoraData) {
                handleJoinCall(agoraData);
              } else {
                setCallError('Missing video call data');
              }
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
  );

  // Inactive conversation view
  if (currentConversation?.status === 'inactive') {
    return (
      <>
        {callInvitationModal}
        <section className="w-full bg-[#F1F9FF] min-h-screen">
          <div className="flex justify-center items-center pt-[5.25rem]">
            <header className="flex items-center w-3/4 justify-between px-6 py-5 bg-[#C0E4FF] shadow-sm rounded-xl">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.back()}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <FaAngleLeft size={20} />
                </button>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Image
                      src={receiverImage}
                      alt={receiver.fullName}
                      width={50}
                      height={50}
                      className="rounded-full object-cover"
                      priority
                    />
                    {receiver.online && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div>
                    <div className="text-sm font-semibold text-gray-700">
                      {receiver.fullName}
                      <span className="ml-2 text-xs text-red-500">(Inactive)</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {receiver.online 
                        ? "Online" 
                        : `Last seen ${moment().format('h:mm A')}`
                      }
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex flex-col justify-center items-center">
                  <div className="flex items-center gap-1 text-sm">Chat</div>
                  <button className="bg-[#F46767] hover:bg-red-500 text-white px-2 py-1 h-6 text-xs rounded-md transition-colors">
                    Inactive
                  </button>
                </div>
                
                {currentConversation?.appointment && (
                  <div className="flex flex-col justify-center items-center">
                    <div className="flex items-center gap-1 text-sm">Appointment</div>
                    <button className={`text-black px-2 py-1 h-6 text-xs rounded transition-colors ${currentConversation.appointment.isPaid ? 'bg-[#008000] text-white' : 'bg-[#FBFB3C]'}`}>
                      {currentConversation.appointment.isPaid ? 'Confirmed' : 'Pending'}
                    </button>
                  </div>
                )}
                
                <div>
                  <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <IoEllipsisVertical size={18} />
                  </button>
                </div>
              </div>
            </header>
          </div>

          <main className="flex flex-col items-center justify-center mt-[5rem]">
            <div className="space-y-8 max-w-2xl px-4 w-full">
              <div className="text-center space-y-2 p-6 bg-white rounded-xl shadow-sm">
                {!isAppointmentPassed && (
                  <div className="text-5xl font-bold text-gray-800 tracking-wide">
                    {String(timeRemaining.days)}d:{" "}
                    {String(timeRemaining.hours).padStart(2, "0")}h:{" "}
                    {String(timeRemaining.minutes).padStart(2, "0")}m:{" "}
                    {String(timeRemaining.seconds).padStart(2, "0")}s
                  </div>
                )}
              
                {currentConversation?.appointment && (
                  <p className="text-gray-600 mt-4">
                    Please wait for doctor confirmation
                  </p>
                )}

                {currentConversation?.appointment?.isPaid === false && (
                  <button
                    onClick={handlePayment}
                    disabled={isPaymentLoading}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-sm font-medium rounded-lg disabled:opacity-50 mt-4 transition-colors"
                  >
                    {isPaymentLoading ? "Processing..." : "Pay Now"}
                  </button>
                )}
              </div>
            </div>
          </main>
        </section>
      </>
    );
  }

  // Main chat view
  return (
    <>
      {callInvitationModal}
      <section className="w-full bg-[#F1F9FF] h-screen flex flex-col">
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-[#C0E4FF] rounded-xl shadow-sm">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => router.back()} 
              className="lg:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <FaAngleLeft size={25} />
            </button>
            <div className="relative h-12 w-12">
              <Image
                src={receiverImage}
                alt={receiver.fullName}
                fill
                className="rounded-full object-cover"
                priority
              />
              {receiver.online && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {receiver.fullName}
              </h3>
              <p className="text-sm text-gray-500">
                {isTyping 
                  ? "typing..." 
                  : receiver.online 
                    ? "Online" 
                    : `Last seen ${moment().format('h:mm A')}`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button 
              onClick={handleVideoCallClick}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Start video call"
              title="Start video call"
            >
              <FiVideo className="text-[#77C4FE]" size={18} />
            </button>
            <button 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Send image"
            >
              <FiImage className="text-[#77C4FE]" size={18} />
            </button>
            <button 
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="More options"
            >
              <FiMoreVertical className="text-[#77C4FE]" size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <MainContainer className="flex-1 overflow-hidden">
            <div className="w-full h-full flex flex-col">
              <div 
                ref={messagesContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-[#F1F9FF]"
              >
                {loading.messages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : filteredMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiMessageSquare className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium">No messages yet</p>
                    <p className="text-sm">Send your first message to start the conversation</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredMessages.map((msg) => {
                      // Handle video call invitations
                      if (msg.type === 'link' && (msg.agoraData || msg.zoomJoinUrl || msg.zoomHostStartUrl)) {
                        const agoraData = msg.agoraData || msg.zoomHostStartUrl || msg.zoomJoinUrl;
                        
                        return (
                          <div
                            key={msg._id}
                            className={`flex ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}
                          >
                            <div className="flex flex-col max-w-[80%]">
                              <div 
                                className={`p-4 rounded-lg shadow-sm ${
                                  msg.msgByUserId === currentUserId 
                                    ? "bg-[#77C4FE] rounded-tr-none" 
                                    : "bg-[#D5EDFF] border border-gray-200 rounded-tl-none"
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <FiVideo className="text-lg" />
                                  <p className="font-medium">Video Call Invitation</p>
                                </div>
                                {msg.msgByUserId !== currentUserId ? (
                                  <button
                                    onClick={() => {
                                      console.log('Joining call from message with data:', agoraData);
                                      if (agoraData) {
                                        handleJoinCall(agoraData);
                                      } else {
                                        setCallError('Missing video call data');
                                      }
                                    }}
                                    disabled={isJoiningCall}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-50"
                                  >
                                    {isJoiningCall ? 'Joining...' : 'Join Video Call'}
                                  </button>
                                ) : (
                                  <p className="text-sm text-gray-600">You sent a video call invitation</p>
                                )}
                              </div>
                              <div className={`flex gap-2 mt-1 ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}>
                                <span className="text-xs text-gray-500">
                                  {moment(msg.createdAt).format("hh:mm A")}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // Handle regular text messages
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}
                        >
                          <div className="flex flex-col max-w-[80%]">
                            <div 
                              className={`p-3 rounded-lg shadow-sm ${
                                msg.msgByUserId === currentUserId 
                                  ? "bg-[#77C4FE] rounded-tr-none" 
                                  : "bg-[#D5EDFF] border border-gray-200 rounded-tl-none"
                              } ${
                                !msg.seen && msg.msgByUserId !== currentUserId 
                                  ? "border-l-4 border-blue-500" 
                                  : ""
                              }`}
                            >
                              <p className="text-sm text-gray-800">{msg.text}</p>
                            </div>
                            <div className={`flex gap-2 mt-1 ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}>
                              <span className="text-xs text-gray-500">
                                {moment(msg.createdAt).format("hh:mm A")}
                              </span>
                              {msg.msgByUserId === currentUserId && (
                                <span className="text-xs text-gray-400">
                                  {msg.seen ? 'Seen' : 'Delivered'}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white rounded-xl">
                <form onSubmit={sendMessage} className="flex items-center w-full">
                  <div className='bg-[#F1F9FF] rounded-full border border-gray-300 px-4 py-2 shadow-sm w-full flex justify-between'>
                    <button type="button" className="text-gray-500 hover:text-blue-500 transition duration-200">
                      <FiSmile size={20} />
                    </button>
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Send your message..."
                      className="flex-1 bg-[#F1F9FF] px-4 py-2 text-[#222222] placeholder-[#222222] focus:outline-none"
                      disabled={!currentConversation}
                      ref={inputRef}
                    />
                    <button type="button" className="text-gray-500 hover:text-blue-500 mx-2 transition duration-200">
                      <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M4.00004 11.5571C12.7742 1.88169 14.7628 2.45166 17.8539 5.39632C20.6252 8.03636 21.1384 9.76254 16.8274 14.6365C10.5662 21.6427 8.75355 21.2427 6.58068 19.1955C3.60828 16.3951 4.83082 14.6365 10 9.99998C11.2686 8.86214 12.4517 7.97229 14 9.49998C15.5484 11.0277 15 12 10 17" stroke="#4E4E4E" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <button 
                    type="submit"
                    className="bg-[#77C4FE] p-3 m-2 rounded-full hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!messageInput.trim() || !currentConversation}
                  >
                    <FiSend className="text-white" size={18} />
                  </button>
                </form>
              </div>
            </div>
          </MainContainer>
        </div>
      </section>
    </>
  );
};

export default MessagePage;
