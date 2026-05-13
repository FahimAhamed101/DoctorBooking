// components/ChatModal.tsx
"use client";

import { Drawer } from "antd";
import { useState, useEffect, useRef } from "react";
import ChatBot from "@/app/(mainLayout)/chat-bot/page";
import emoji from "@/assets/hero-section/emoji.png";
import Image from "next/image";
import { motion } from "framer-motion";

const ChatModal = () => {
  const [open, setOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const showDrawer = () => {
    setOpen(true);
  };

  const onClose = () => {
    setOpen(false);
  };

  // Close drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <>
      <motion.div
        className="fixed right-8 bottom-8 z-[1000]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1,
          y: [0, -10, 0]
        }}
        transition={{ 
          delay: 0.6,
          y: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
        whileHover={{ 
          scale: 1.05,
          y: 0
        }}
      >
        <motion.button
          onClick={showDrawer}
          className="flex gap-3 items-center bg-[#F6F9FF] shadow-lg shadow-blue-200/50 px-6 py-3 rounded-3xl cursor-pointer border border-blue-100"
          whileTap={{ scale: 0.95 }}
          aria-label="Open chat"
        >
          <Image 
            src={emoji} 
            alt="Chat icon" 
            width={40} 
            height={40}
            priority
            className="hover:animate-bounce"
          />
          <div className="flex flex-col gap-1">
            <span className="text-xl font-semibold text-[#2AA7FF]">ChatBot</span>
            <span className="text-xs text-blue-400">Ask me anything</span>
          </div>
        </motion.button>
      </motion.div>

      <Drawer
        title={
          <div className="flex items-center gap-2">
            <Image 
              src={emoji} 
              alt="Chat icon" 
              width={28} 
              height={28}
            />
            <span className="text-lg font-semibold">AI Trusted GP care Assistant</span>
          </div>
        }
        placement="right"
        onClose={onClose}
        open={open}
        width={500}
        closable={true}
        maskClosable={true}
        destroyOnClose={true}
        headerStyle={{ 
          padding: "16px 24px", 
          borderBottom: "1px solid #f0f0f0",
          background: "#F6F9FF"
        }}
        bodyStyle={{ 
          padding: 0,
          background: "#F6F9FF",
          overflow: "hidden"
        }}
        getContainer={false}
        style={{ position: 'fixed' }}
      >
        <div className="h-full" ref={drawerRef}>
          <ChatBot />
        </div>
      </Drawer>
    </>
  );
};

export default ChatModal;