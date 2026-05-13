"use client";
import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { FiImage, FiMoreVertical, FiSmile, FiVideo } from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa6";
import { initializeSocket, getSocket } from "../../../../services/socketService";
import { RootState } from "../../../../redux/store";
import Image from "next/image";
import notfound from "@/assets/sentmessage.svg";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";
import { IoEllipsisVertical } from "react-icons/io5";
import { 
  addMessage, 
  setCurrentConversation,
  setMessages,
  setTyping,
  updateConversationStatus,
  setError,
  setLoading,
  markMessagesAsSeen
} from "@/redux/features/socket/conversationSlice";
import { useCreateAppointmentPaymentMutation } from "@/redux/features/auth/appontmentApi";

interface Message {
  _id: string;
  text?: string;
  msgByUserId: string;
  createdAt: string;
  seen: boolean;
  isTemporary?: boolean;
  type: 'text' | 'image' | 'video' | 'link';
  zoomJoinUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  consultationLink?: string;
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

const MessagePage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useParams<{ userId: string }>();
  const appointmentId = params?.userId;
  
  const {
    currentConversation,
    messages,
    loading,
    error,
    isTyping
  } = useSelector((state: RootState) => state.conversation as ConversationState);

  // Fixed: Check both possible property names for user ID
  const currentUser = useSelector((state: RootState) => state.auth.user) ;
  const currentUserId =  currentUser?.id;

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const seenTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [createPayment] = useCreateAppointmentPaymentMutation();

  // Filter messages to only show those for the current conversation
  const filteredMessages = useMemo(() => {
    if (!currentConversation?._id || !messages) return [];
    
    return messages.filter(msg => 
      msg.conversationId === currentConversation._id ||
      // Fallback if conversationId is not set on message
      !msg.conversationId
    ).sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [messages, currentConversation]);

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

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, []);

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

  useEffect(() => {
    if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
    
    seenTimeoutRef.current = setTimeout(() => {
      scrollToBottom();
    }, 100);

    return () => {
      if (seenTimeoutRef.current) clearTimeout(seenTimeoutRef.current);
    };
  }, [filteredMessages, scrollToBottom]);

  const handleTyping = useCallback(() => {
    if (currentConversation?.status === 'inactive') return;
    
    const socket = getSocket();
    if (!socket || !receiver?._id) return;
    
    socket.emit("typing", { receiverId: receiver._id });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => dispatch(setTyping(false)), 2000);
  }, [receiver?._id, currentConversation?.status, dispatch]);

  const handlePayment = async () => {
    try {
      setIsPaymentLoading(true);
      
      // Fixed: Get appointment ID from the correct source
      const paymentAppointmentId = 
                                  currentConversation?.appointment?.appointmentId 

      if (!paymentAppointmentId) {
        dispatch(setError("No appointment ID found"));
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
        dispatch(setError("Payment successful but no redirect URL provided"));
      }
    } catch (err) {
      if(err){
         dispatch(setError("Payment failed. Please try again."));
      }
     
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentConversation?.status === 'inactive') {
      dispatch(setError("This conversation is inactive. You cannot send messages."));
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
          dispatch(setError(ack?.error?.message || "Failed to send message"));
        }
      });
    } catch (err) {
      if(err){
        dispatch(setMessages(messages.filter(msg => msg._id !== tempId)));
      dispatch(setError("Failed to send message"));
      }
      
    }
  }, [messageInput, currentUserId, receiver?._id, currentConversation, dispatch, messages, appointmentId]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
    handleTyping();
  }, [sendMessage, handleTyping]);

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
          dispatch(setError("Receiver ID not found"));
          return;
        }

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
          // Filter messages to only include those for current conversation
          const relevantMessages = data.filter(msg => 
            !currentConversation || msg.conversationId === currentConversation._id || !msg.conversationId
          );
          
          dispatch(setMessages(relevantMessages));
          dispatch(setLoading({ initial: false, messages: false }));
        
          
          // Mark unread messages as seen
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
          if (!currentConversation || newMessage.conversationId === currentConversation._id || !newMessage.conversationId) {
            dispatch(addMessage(newMessage));
            
            
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
          dispatch(setError(errorData.message || "Connection error"));
          dispatch(setLoading({ initial: false, messages: false }));
        };

        const handleConversationData = (data: ConversationData) => {
          if (!data._id) {
            dispatch(setError("Conversation data missing required fields"));
            return;
          }
          
          // Normalize appointmentId format
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

        socket.on("conversation-status-updated", handleStatusUpdate);
        socket.on("user-status", handleUserStatus);
        socket.on("message", handleMessages);
        socket.on("new-message", handleNewMessage);
        socket.on("typing", handleTypingEvent);
        socket.on("error", handleError);
        socket.on("conversation-data", handleConversationData);

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

      } catch (err) {
        if(err){
               dispatch(setError("Failed to connect. Please refresh the page."));
        dispatch(setLoading({ initial: false, messages: false }));
        }
   
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
    };
  }, [currentUserId, appointmentId, router, scrollToBottom, dispatch, currentConversation?._id]);

  const handleRetry = useCallback(() => {
    dispatch(setError(null));
    dispatch(setLoading({ initial: true, messages: true }));
    socketInitialized.current = false;
    window.location.reload();
  }, [dispatch]);

  if (error && !loading.initial) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center max-w-md p-6 rounded-xl bg-gray-50 shadow-sm">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
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

  const receiverImage = receiver.profileImage
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${receiver.profileImage}`
    : "/uploads/user.png";

  if (currentConversation?.status === 'inactive') {
    return (
      <section className="w-full bg-[#F1F9FF] min-h-screen">
        <div className="flex justify-center items-center pt-[5.25rem]">
          <header className="flex items-center w-3/4 justify-between px-6 py-5 bg-[#C0E4FF] shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-1 rounded-full hover:bg-gray-100"
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

            <div className="flex flex-cols-1 justify-center items-center gap-4">
              <div className="flex flex-col justify-center items-center">
                <div className="flex items-center gap-1 text-sm">Chat</div>
                <button className="bg-[#F46767] hover:bg-red-500 text-white px-2 py-1 h-6 text-xs rounded-md">
                  Inactive
                </button>
              </div>
              
              {currentConversation?.appointment && (
                <div className="flex flex-col justify-center items-center">
                  <div className="flex items-center gap-1 text-sm">Appointment</div>
                  <button className={`text-black px-2 py-1 h-6 text-xs rounded ${currentConversation.appointment.isPaid ? 'bg-[#008000] text-white' : 'bg-[#FBFB3C]'}`}>
                    {currentConversation.appointment.isPaid ? 'Confirm' : 'Pending'}
                  </button>
                </div>
              )}
              
              <div>
                <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-100">
                  <IoEllipsisVertical size={18} />
                </button>
              </div>
            </div>
          </header>
        </div>

        <main className="flex flex-col items-center justify-center mt-[5rem]">
          <div className="space-y-8 max-w-2xl px-4 w-full">
            <div className="text-center space-y-2 p-6">
              {!isAppointmentPassed && (
                <div className="text-5xl font-bold text-gray-800 tracking-wide">
                  {String(timeRemaining.days)}d:{" "}
                  {String(timeRemaining.hours).padStart(2, "0")}h:{" "}
                  {String(timeRemaining.minutes).padStart(2, "0")}m:{" "}
                  {String(timeRemaining.seconds).padStart(2, "0")}s
                </div>
              )}
            
              {currentConversation?.appointment && (
                <p className="text-gray-600">
                  Please wait for doctor confirmation
                </p>
              )}

              {currentConversation?.appointment?.isPaid === false && (
                <button
                  onClick={handlePayment}
                  disabled={isPaymentLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 text-sm font-medium rounded disabled:opacity-50 mt-4"
                >
                  {isPaymentLoading ? "Processing..." : "Pay Now"}
                </button>
              )}
            </div>
          </div>
        </main>
      </section>
    );
  }

  return (
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
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      ></path>
                    </svg>
                  </div>
                  <p className="text-lg font-medium">No messages yet</p>
                  <p className="text-sm">Send your first message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMessages.map((msg) => (
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
                          {msg.type === 'link' && msg.zoomJoinUrl ? (
                            <a 
                              href={msg.zoomJoinUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline flex items-center"
                            >
                              <FiVideo className="mr-2" />
                              Join Zoom Meeting
                            </a>
                          ) : (
                            <p className="text-sm text-gray-800">{msg.text}</p>
                          )}
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
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="p-4 bg-white rounded-xl">
              <form onSubmit={sendMessage}>
                <div className="flex items-center bg-white rounded-full border border-gray-300 px-4 py-2 shadow-sm">
                  <button 
                    type="button" 
                    className="text-gray-500 flex hover:text-blue-500 transition duration-200"
                  >
                    <FiSmile size={24} />
                  </button>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Send your message..."
                    className="px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none rounded-full w-full"
                    ref={inputRef}
                    
                  />
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-blue-500 transition duration-200 disabled:opacity-50"
                    
                  >
                    <Image src={notfound} alt="Send" width={20} height={16} />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </MainContainer>
      </div>
    </section>
  );
};

export default MessagePage;