"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import moment from "moment";
import { FiImage, FiMoreVertical, FiPhone, FiVideo, FiSmile } from "react-icons/fi";
import { FaAngleLeft } from "react-icons/fa6";
import { initializeSocket, getSocket } from "../../../../services/socketService";
import { RootState } from "../../../../redux/store";
import Image from "next/image";
import file from "@/assets/file.svg";
import notfound from "@/assets/sentmessage.svg";
import MainContainer from "@/components/Shared/MainContainer/MainContainer";

interface Message {
  _id: string;
  text: string;
  msgByUserId: string;
  createdAt: string;
  seen: boolean;
  isTemporary?: boolean;
  type?: string;
  zoomJoinUrl?: string;
}

interface Receiver {
  profileImage: string;
  _id: string;
  fullName: string;
  online: boolean;
}

interface ConversationData {
  _id: string;
  status: string;
  sender: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  receiver: {
    _id: string;
    fullName: string;
    profileImage?: string;
  };
  appointmentId: string;
}

const MessagePage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ userId: string }>();
  const appointmentId = params?.userId;
  const currentUserId = useSelector((state: RootState) => state.auth.user?.id);
 // const currentUser = useSelector((state: RootState) => state.auth.user);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiver, setReceiver] = useState<Receiver>({
    _id: "",
    fullName: "Loading...",
    profileImage: "",
    online: false,
  });
  const [loading, setLoading] = useState({
    initial: true,
    messages: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [conversationStatus, setConversationStatus] = useState("active");
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketInitialized = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const markMessagesAsSeen = useCallback(() => {
    const socket = getSocket();
    if (!socket || !receiver?._id || !appointmentId) return;

    socket.emit("seen", {
      msgByUserId: receiver._id,
      appointmentId: appointmentId,
    });
  }, [receiver?._id, appointmentId]);

  const handleTyping = () => {
    const socket = getSocket();
    if (!socket || !receiver?._id) return;
    
    socket.emit("typing", { receiverId: receiver._id });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
    handleTyping();
  };

  const toggleConversationStatus = () => {
    const socket = getSocket();
    if (!socket || !conversationData) return;

    const newStatus = conversationStatus === "active" ? "inactive" : "active";
    
    socket.emit("update-conversation-status", {
      conversationId: conversationData._id,
      status: newStatus
    }, (response: { success: boolean; conversation?: ConversationData }) => {
      if (response?.success && response.conversation) {
        setConversationStatus(newStatus);
        setConversationData(response.conversation);
      }
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    // Get the selected conversation from localStorage
    const storedConversation = localStorage.getItem("selectedConversation");
    if (storedConversation) {
      try {
        const conversation = JSON.parse(storedConversation);
        setConversationData(conversation);
        setConversationStatus(conversation.status || "active");
      } catch (err) {
        console.error("Failed to parse conversation data", err);
      }
    }

    const initSocket = async () => {
      try {
        if (!socketInitialized.current) {
          await initializeSocket(token);
          socketInitialized.current = true;
        }

        const socket = getSocket();
        if (!socket || !currentUserId || !appointmentId) return;

        const receiverId = localStorage.getItem("receiverId");
        if (!receiverId) {
          setError("Receiver ID not found");
          return;
        }

        // Listen for conversation status updates
        socket.on("conversation-status-updated", (updatedConversation: ConversationData) => {
          if (updatedConversation.appointmentId === appointmentId) {
            setConversationStatus(updatedConversation.status);
            setConversationData(updatedConversation);
          }
        });

        // Listen for user status updates
        socket.on("user-status", ({ userId, online }) => {
          if (userId === receiverId) {
            setReceiver(prev => ({ ...prev, online }));
          }
        });
        
        socket.on("message-user", (data: Receiver) => {
          setReceiver(data);
          localStorage.setItem("receiverId", data._id);
        });

        socket.on("message", (data: Message[]) => {
          setMessages(data);
          setLoading(prev => ({ ...prev, messages: false, initial: false }));
          scrollToBottom();
          markMessagesAsSeen();
        });

        socket.on("new-message", (newMessage: Message) => {
          setMessages(prev => {
            const filteredMessages = prev.filter(msg => 
              !msg.isTemporary || msg._id !== `temp_${newMessage._id}`
            );
            return [...filteredMessages, newMessage];
          });
          scrollToBottom();
          if (newMessage.msgByUserId !== currentUserId) {
            markMessagesAsSeen();
          }
        });

        socket.on("typing", () => {
          setIsTyping(true);
          if (typingTimeout) clearTimeout(typingTimeout);
          const timeout = setTimeout(() => setIsTyping(false), 2000);
          setTypingTimeout(timeout);
        });

        socket.on("error", (errorData: { message?: string }) => {
          setError(errorData.message || "Connection error");
          setLoading(prev => ({ ...prev, messages: false, initial: false }));
        });

        socket.emit("message-page", { 
          receiver: receiverId,
          appointmentId
        });

      } catch (error) {
        if(error){
                  setError("Failed to connect. Please refresh the page.");
        setLoading(prev => ({ ...prev, initial: false }));
        }

      }
    };

    initSocket();

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.off("message-user");
        socket.off("message");
        socket.off("conversation-status-updated");
        socket.off("new-message");
        socket.off("typing");
        socket.off("error");
      }
      if (typingTimeout) clearTimeout(typingTimeout);
    };
  }, [currentUserId, appointmentId, router, markMessagesAsSeen, typingTimeout]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const socket = getSocket();
    if (!messageInput.trim() || !socket || !appointmentId || !currentUserId || !receiver?._id) {
      return;
    }

    const messagePayload = {
      sender: currentUserId,
      receiver: receiver._id,
      appointmentId,
      text: messageInput,
      msgByUserId: currentUserId,
      type: "text",
    };

    const tempId = `temp_${Date.now()}`;
    const tempMessage: Message = {
      _id: tempId,
      text: messageInput,
      msgByUserId: currentUserId,
      createdAt: new Date().toISOString(),
      seen: false,
      isTemporary: true,
    };

    setMessages(prev => [...prev, tempMessage]);
    setMessageInput("");
    scrollToBottom();
    inputRef.current?.focus();

    try {
      socket.emit("new-message", messagePayload, (ack: { 
        success: boolean; 
        error?: { message: string } 
      }) => {
        if (!ack?.success) {
          setMessages(prev => prev.filter(msg => msg._id !== tempId));
          setError(ack?.error?.message || "Failed to send message");
        }
      });
    } catch (error) {
      if(error){
setMessages(prev => prev.filter(msg => msg._id !== tempId));
      setError("Failed to send message");
      }
      
    }
  };

  const handleRetry = () => {
    setError(null);
    setLoading({
      initial: true,
      messages: true,
    });
    socketInitialized.current = false;
    window.location.reload();
  };

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

  return (
    <section className="w-full bg-[#F1F9FF] py-10">
      <MainContainer>
        <div className="w-full flex flex-col h-[92%] p-2 py-2">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-[#C0E4FF] rounded-xl shadow-sm sticky top-0 z-10">
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
              <button 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Send image"
              >
                <FiImage className="text-[#77C4FE]" size={18} />
              </button>
              <button 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Call"
              >
                <FiPhone className="text-[#77C4FE]" size={18} />
              </button>
              <button 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Video call"
              >
                <FiVideo className="text-[#77C4FE]" size={18} />
              </button>
              <button 
                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="More options"
              >
                <FiMoreVertical className="text-[#77C4FE]" size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages Area */}
          <div 
            className="flex-1 p-4 overflow-y-auto bg-[#F1F9FF]"
            onScroll={markMessagesAsSeen}
          >
            {loading.messages ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : messages.length === 0 ? (
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
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.msgByUserId === currentUserId ? "justify-end" : "justify-start"}`}
                  >
                    <div className="flex flex-col">
                      <div 
                        className={`max-w-[65rem] p-3 rounded-lg shadow-sm ${msg.msgByUserId === currentUserId ? "bg-[#77C4FE]" : "bg-[#D5EDFF] border border-gray-200"}`}
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
                      <div className={`flex gap-2  ${msg.msgByUserId === currentUserId ? "flex-row-reverse" : "flex-row"}`}>
                        <span className="text-xs text-[#222222]">
                          {msg.msgByUserId === currentUserId ? "You" : receiver.fullName}
                        </span> <span className="text-xs text-[#77C4FE]">
                          {moment(msg.createdAt).format("hh:mm A")}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white rounded-xl">
            <form onSubmit={sendMessage}>
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send your message..."
                className="flex-1 px-4 py-2 text-gray-700 placeholder-gray-400 focus:outline-none rounded-full w-full mb-2"
                ref={inputRef}
              />
              <div className="flex justify-between items-center bg-white rounded-full border border-gray-300 px-4 py-2 shadow-sm">
                <button type="button" className="text-gray-500 flex hover:text-blue-500 transition duration-200">
                  <FiSmile size={24} />
                  <Image src={file} alt="Attach file" width={20} height={16} className="ml-2" />
                </button>
                <button
                  type="submit"
                  className="text-gray-500 hover:text-blue-500 transition duration-200"
                >
                  <Image src={notfound} alt="Send" width={20} height={16} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </MainContainer>
    </section>
  );
};

export default MessagePage;