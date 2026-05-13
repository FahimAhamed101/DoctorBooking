// app/(mainLayout)/chat-bot/page.tsx
"use client";

import { Input, Button, message, Spin, Typography } from "antd";
import React, { useState, useRef, useEffect } from "react";
import { useChatWithBotMutation } from "@/redux/features/auth/authApi";
import { SendOutlined } from "@ant-design/icons";


interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp?: number;
}

const { Text } = Typography;

const ChatBot: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerChat] = useChatWithBotMutation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    try {
      setIsLoading(true);
      const userMessage: ChatMessage = {
        role: 'user',
        content: inputValue,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');

      const response = await triggerChat({
        model: "gemini-1.5-flash",
        prompt: inputValue
      }).unwrap();

      if (response.code === 200) {
        const botResponse = response.data.attributes.candidates[0].content.parts[0].text;
        const botMessage: ChatMessage = {
          role: 'bot',
          content: botResponse,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        messageApi.error('Failed to get response from AI');
      }
    } catch (error) {
      messageApi.error('An error occurred while processing your request');
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-full w-[500px] flex flex-col">
      {contextHolder}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
        <h1 className="text-base font-medium text-gray-900">Today</h1>
        <Button 
          type="primary" 
          className="bg-[#5DADE2] hover:bg-[#4A9FD9] text-white text-sm h-9 px-4 rounded-md font-medium"
          onClick={() => setInputValue('Give me some Trusted GP care suggestions')}
        >
          Quick Question
        </Button>
      </div>

      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6"
        style={{
          scrollBehavior: 'smooth',
          scrollPaddingBottom: '20px'
        }}
      >
        {messages.length > 0 ? (
          <div className="space-y-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div 
                key={`${msg.timestamp}-${index}`} 
                className={`p-3 rounded-lg relative ${msg.role === 'user' ? 'bg-[#5DADE2] text-white ml-auto max-w-[85%]' : 'bg-gray-100 text-gray-900 mr-auto max-w-[85%]'}`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                <Text 
                  className={`text-xs block mt-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}
                >
                  {formatTime(msg.timestamp)}
                </Text>
              </div>
            ))}
            {isLoading && (
              <div className="p-3 rounded-lg bg-gray-100 text-gray-900 mr-auto max-w-[85%]">
                <Spin size="small" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-900 font-medium text-sm mb-1">👋 Hello!</p>
            <p className="text-gray-900 text-sm">
              I&apos;m your AI Trusted GP care assistant. Ask me anything about Trusted GP care!
            </p>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-100">
        <div className="relative">
          <Input.TextArea
            ref={inputRef}
            placeholder="Ask about Trusted GP care, prices, or anything else..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleKeyPress}
            className="w-full px-5 py-4 pr-14 text-white rounded-2xl border-[7px] border-[#F1F9FF] placeholder-white text-base shadow-sm"
            style={{ backgroundColor: "#7DD3FC" }}
            disabled={isLoading}
            autoSize={{ minRows: 1, maxRows: 4 }}
            allowClear
          />
          <Button
            type="text"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            icon={<SendOutlined className="text-white text-base" />}
            onClick={handleSendMessage}
            loading={isLoading}
            disabled={isLoading || !inputValue.trim()}
            aria-label="Send message"
          />
        </div>
      </div>
    </div>
  );
};

export default ChatBot;