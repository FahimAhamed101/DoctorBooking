// app/message/layout.tsx
import Sidebar from './sidebar';
import { ReactNode } from 'react';

interface MessageLayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: MessageLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - always visible on desktop, toggleable on mobile */}
      <div className="hidden md:block md:w-1/3 lg:w-1/4 h-full">
        <Sidebar />
      </div>
      
      {/* Main content area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

export default Layout;