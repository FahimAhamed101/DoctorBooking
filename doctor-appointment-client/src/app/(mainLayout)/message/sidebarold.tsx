"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { FiArrowUpLeft } from "react-icons/fi";
import { FaImage, FaVideo } from "react-icons/fa";
import { initializeSocket, getSocket } from "../../../services/socketService";
import { RootState } from "../../../redux/store";
import Image from "next/image";
import search from "@/assets/search.svg";
import { 
  setConversations,
  setLoading,
  setError,
  markMessagesAsSeen,
  addMessage,
  updateConversationStatus
} from "@/redux/features/socket/conversationSlice";

interface User {
  _id: string;
  fullName: string;
  profileImage?: string;
  image?: string;
  online?: boolean;
}

interface Message {
  _id: string;
  text?: string;
  type: 'text' | 'image' | 'video' | 'link';
  createdAt: string;
  seen: boolean;
  msgByUserId: string;
}

interface LastMessage {
  text?: string;
  type: 'text' | 'image' | 'video' | 'link';
  createdAt: string;
  seen: boolean;
  msgByUserId?: string;
}

interface AppointmentId {
  _id: string;
  appointmentDate?: string;
  status?: string;
}

interface Conversation {
  _id: string;
  sender: User;
  receiver: User;
  appointmentId: AppointmentId;
  messages: Message[];
  updatedAt?: string;
  createdAt?: string;
  status?: 'active' | 'inactive';
  lastMsg?: LastMessage;
  unseenMsg?: number;
  title?: string;
}

interface LoadingState {
  initial?: boolean;
  messages?: boolean;
}

interface ConversationState {
  conversations: Conversation[];
  loading: LoadingState;
  error: string | null;
}

const MAX_RETRY_ATTEMPTS = 2;

const ChatPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [retryCount, setRetryCount] = useState<number>(() => {
    // Initialize retryCount from sessionStorage if available
    if (typeof window !== 'undefined') {
      const savedCount = sessionStorage.getItem('retryCount');
      return savedCount ? parseInt(savedCount) : 0;
    }
    return 0;
  });

  const { conversations, loading, error } = useSelector((state: RootState) => state.conversation) as ConversationState;
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const currentUserId: string | undefined = currentUser?.id;

  const handleRetry = (): void => {
    const newCount = retryCount + 1;
    setRetryCount(newCount);
    // Store the retry count in sessionStorage
    sessionStorage.setItem('retryCount', newCount.toString());
    
    if (newCount <= MAX_RETRY_ATTEMPTS) {
      window.location.reload();
    } else {
      dispatch(setError("Maximum retry attempts reached. Please try again later."));
      // Reset the retry count after reaching max attempts
      sessionStorage.removeItem('retryCount');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
 
    if (!token  ) {
      router.push("/login");
      return;
    }

    const initSocket = async (): Promise<(() => void) | void> => {
      try {
        dispatch(setLoading(true));
        await initializeSocket(token) ;
        const socket = getSocket();
        
        if (!socket || !currentUserId) {
          throw new Error("Socket initialization failed");
        }

        socket.emit("conversation-page", { currentUserId });

        const handleConversation = (data: Conversation[]): void => {
          const processedConversations = data.map(conv => ({
            ...conv,
            createdAt: conv.createdAt || new Date().toISOString(),
            updatedAt: conv.updatedAt || new Date().toISOString(),
            messages: conv.messages.map(msg => ({
              ...msg,
              msgByUserId: msg.msgByUserId || '',
              type: msg.type === 'text' || msg.type === 'image' || msg.type === 'video' || msg.type === 'link'
                ? msg.type
                : 'text'
            })),
            lastMsg: conv.lastMsg ? {
              ...conv.lastMsg,
              type: conv.lastMsg.type === 'text' || conv.lastMsg.type === 'image' || conv.lastMsg.type === 'video' || conv.lastMsg.type === 'link'
                ? conv.lastMsg.type
                : 'text'
            } : undefined
          }))
          
          dispatch(setConversations(processedConversations || []));
          dispatch(setLoading(false));
          dispatch(setError(null));
          // Reset retry count on successful connection
          setRetryCount(0);
          sessionStorage.removeItem('retryCount');
        };

        const handleError = (errorData: { message?: string }): void => {
          dispatch(setError(errorData.message || "Connection error"));
          dispatch(setLoading(false));
          handleRetry();
        };

        const handleNewMessage = (message: Message): void => {
          dispatch(addMessage(message));
        };

        const handleMessageSeen = ({ conversationId }: { conversationId: string }): void => {
          if (currentUserId) {
            dispatch(markMessagesAsSeen({ conversationId, userId: currentUserId }));
          }
        };

        const handleStatusUpdate = (updatedConversation: Conversation): void => {
          dispatch(updateConversationStatus({
            conversationId: updatedConversation._id,
            status: updatedConversation.status || 'active'
          }));
        };

        socket.on("conversation", handleConversation);
        socket.on("error", handleError);
        socket.on("new-message", handleNewMessage);
        socket.on("message-seen", handleMessageSeen);
        socket.on("conversation-status-updated", handleStatusUpdate);

        return (): void => {
          if (socket) {
            socket.off("conversation", handleConversation);
            socket.off("error", handleError);
            socket.off("new-message", handleNewMessage);
            socket.off("message-seen", handleMessageSeen);
            socket.off("conversation-status-updated", handleStatusUpdate);
          }
        };

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Failed to connect. Please refresh the page.";
        dispatch(setError(errorMessage));
        dispatch(setLoading(false));
        handleRetry();
      }
    };

    initSocket();
  }, [currentUserId, router, dispatch]);

  const prevStatusesRef = useRef<Record<string, string>>({});

  useEffect(() => {
    let shouldReload = false;
    const currentStatuses: Record<string, string> = {};

    conversations.forEach(conv => {
      currentStatuses[conv._id] = conv.status || '';
      
      if (prevStatusesRef.current[conv._id] && 
          prevStatusesRef.current[conv._id] !== conv.status) {
        shouldReload = true;
      }
    });

    if (shouldReload) {
      window.location.reload();
    }

    prevStatusesRef.current = currentStatuses;
  }, [conversations]);

  const handleConversationClick = (conversation: Conversation): void => {
    if (!currentUserId) return;
    
    const otherUser = conversation.sender._id === currentUserId 
      ? conversation.receiver 
      : conversation.sender;
    localStorage.setItem("receiverId", otherUser._id);
    router.push(`/message/${conversation.appointmentId._id}`);
  };
  const handleManualRefresh = (): void => {
    setRetryCount(0);
   
    dispatch(setError(null));
    window.location.reload();
  };

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
         {retryCount < MAX_RETRY_ATTEMPTS  ? (
            <button
              onClick={handleRetry}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry Connection ({MAX_RETRY_ATTEMPTS - retryCount} attempts left)
            </button>
          ) : (
            <div>
              <p className="text-red-500 mb-4">Maximum retry attempts reached. Please try again later.</p>
              <button
                onClick={handleManualRefresh}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (loading.initial || loading.messages) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-white">
        <h2 className="text-2xl font-bold text-[#77C4FE]">Messages</h2>
        <button className="h-8 w-8 rounded-full bg-[#F3F3F3] flex justify-center items-center text-gray-700">
          <Image src={search} alt="search" width={20} height={20} />
        </button>
      </div>

      {/* Conversations List */}
      <div className="bg-[#C0E4FF] border-r border-gray-200 mt-3 p-5 overflow-y-auto flex-1">
        {conversations.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="flex justify-center items-center my-4 text-slate-500">
              <FiArrowUpLeft size={50} />
            </div>
            <p className="text-lg text-slate-400">No conversations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              if (!currentUserId) return null;
              
              const otherUser = conversation.sender._id === currentUserId 
                ? conversation.receiver 
                : conversation.sender;
              
              const lastMessage = conversation.lastMsg || conversation.messages?.[0] || {};
              const unseenCount = conversation.unseenMsg ?? 
                (conversation.messages?.filter(
                  (msg: Message) => !msg.seen && msg.msgByUserId !== currentUserId
                ).length ?? 0);

              const lastActive = lastMessage.createdAt 
                ? new Date(lastMessage.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : '';

              const receiverImage = otherUser.profileImage || otherUser.image
                ? `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ''}${otherUser.profileImage || otherUser.image}`
                : "/uploads/user.png";

              return (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationClick(conversation)}
                  className={`flex items-center p-4 bg-[#F1F9FF] rounded-lg shadow-sm hover:bg-blue-50 cursor-pointer transition-all duration-200 `}
                >
                  {/* User Image with Online Status */}
                  <div className="relative w-12 h-12">
                    <Image
                      src={receiverImage}
                      alt={otherUser.fullName}
                      fill
                      className="rounded-full object-cover border-2 border-gray-200"
                    />
                    {/* Online Status Indicator */}
                    {otherUser.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-gray-900 font-semibold text-base">
                        {conversation.title || otherUser.fullName}
                      </h3>
                      <div className="flex items-center">
                       {/* {conversation.status === 'inactive' && (
                          <span className="text-xs text-red-500 mr-2">Inactive</span>
                        )}*/}
                        <span className="text-xs text-gray-400">
                          {lastActive}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      {lastMessage?.type === 'image' && (
                        <FaImage className="text-gray-400" />
                      )}
                      {lastMessage?.type === 'video' && (
                        <FaVideo className="text-gray-400" />
                      )}
                      <p className="truncate">
                        {lastMessage?.text || 
                        (lastMessage?.type === 'link' ? 'Meeting link' : 'No messages')}
                      </p>
                    </div>
                  </div>

                  {/* Unread Message Badge */}
                  {unseenCount > 0 && (
                    <div className="ml-2 bg-[#77C4FE] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                      {unseenCount}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;