// features/conversation/conversationSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Message {
  _id: string;
  msgByUserId: string;
  text?: string;
  type: 'text' | 'image' | 'video' | 'link' | 'agora_call';
  createdAt: string;
  seen: boolean;
  isTemporary?: boolean;
  zoomJoinUrl?: string;
  zoomHostStartUrl?: string;
  agoraData?: unknown;
  imageUrl?: string;
  videoUrl?: string;
  consultationLink?: string;
}

interface User {
  _id: string;
  fullName: string;
  profileImage?: string;
  image?: string;
  online?: boolean;
}

interface LastMessage {
  text?: string;
  type: string;
  createdAt: string;
  seen: boolean;
}

// In your conversationSlice.ts, update the Conversation interface to match:
interface Conversation {
  _id: string;
  sender: User;
  receiver: User;
  appointmentId: {
    _id: string;
    // other appointment properties if needed
  };
  messages: Message[];
  updatedAt?: string;
  createdAt?: string;
  status?: string;
  lastMsg?: LastMessage;
  unseenMsg?: number;
  title?: string;
}

interface ConversationState {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  messages: Message[];
  loading: {
    initial: boolean;
    messages: boolean;
  };
  error: string | null;
  isTyping: boolean;
}

const initialState: ConversationState = {
  currentConversation: null,
  conversations: [],
  messages: [],
  loading: {
    initial: false,
    messages: false
  },
  error: null,
  isTyping: false,
};

export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setConversations: (state, action: PayloadAction<Conversation[]>) => {
      state.conversations = action.payload;
    },
    setCurrentConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.currentConversation = action.payload;
      if (action.payload) {
        state.messages = action.payload.messages || [];
      }
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      
      // Add to messages array
      state.messages = [...state.messages, message];
      
      // Update current conversation messages
      if (state.currentConversation) {
        state.currentConversation.messages = [...state.currentConversation.messages, message];
        state.currentConversation.lastMsg = message;
        state.currentConversation.updatedAt = new Date().toISOString();
      }

      // Update in conversations list
      state.conversations = state.conversations.map(conv => {
        if (conv._id === state.currentConversation?._id) {
          return {
            ...conv,
            messages: [...conv.messages, message],
            lastMsg: message,
            updatedAt: new Date().toISOString(),
            unseenMsg: message.msgByUserId !== conv.sender._id ? 
              (conv.unseenMsg || 0) + 1 : 
              conv.unseenMsg
          };
        }
        return conv;
      });
    },
    updateConversationStatus: (
      state, 
      action: PayloadAction<{ conversationId: string; status: 'active' | 'inactive' }>
    ) => {
      const { conversationId, status } = action.payload;
      
      // Update in conversations list
      state.conversations = state.conversations.map(conv => 
        conv._id === conversationId ? { ...conv, status } : conv
      );
      
      // Update current conversation
      if (state.currentConversation?._id === conversationId) {
        state.currentConversation.status = status;
      }
    },
    markMessagesAsSeen: (state, action: PayloadAction<{ conversationId: string; userId: string }>) => {
      const { conversationId, userId } = action.payload;
      
      // Update in conversations list
      state.conversations = state.conversations.map(conv => {
        if (conv._id === conversationId) {
          const updatedMessages = conv.messages.map(msg => 
            msg.msgByUserId !== userId ? { ...msg, seen: true } : msg
          );
          
          return {
            ...conv,
            messages: updatedMessages,
            unseenMsg: 0
          };
        }
        return conv;
      });

      // Update current conversation
      if (state.currentConversation?._id === conversationId) {
        state.currentConversation.messages = state.currentConversation.messages.map(msg => 
          msg.msgByUserId !== userId ? { ...msg, seen: true } : msg
        );
        state.currentConversation.unseenMsg = 0;
        
        // Update messages array
        state.messages = state.messages.map(msg => 
          msg.msgByUserId !== userId ? { ...msg, seen: true } : msg
        );
      }
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.isTyping = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean | { initial?: boolean; messages?: boolean }>) => {
      if (typeof action.payload === 'boolean') {
        state.loading.initial = action.payload;
        state.loading.messages = action.payload;
      } else {
        if (action.payload.initial !== undefined) {
          state.loading.initial = action.payload.initial;
        }
        if (action.payload.messages !== undefined) {
          state.loading.messages = action.payload.messages;
        }
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetConversationState: () => initialState,
  },
});

export const { 
  setConversations,
  setCurrentConversation,
  setMessages,
  addMessage,
  updateConversationStatus,
  markMessagesAsSeen,
  setTyping,
  setLoading,
  setError,
  resetConversationState
} = conversationSlice.actions;

export default conversationSlice.reducer;
