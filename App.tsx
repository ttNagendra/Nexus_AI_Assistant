
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import VoicePanel from './components/VoicePanel';
import ImageGenerator from './components/ImageGenerator';
import Auth from './components/Auth';
import { ViewType } from './types';
import { Bell, Search, User, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.CHAT);
  const [user, setUser] = useState<any>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem('nexus_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsAuthChecking(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('nexus_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('nexus_user');
  };

  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-black flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case ViewType.CHAT:
        return <ChatWindow user={user} />;
      case ViewType.VOICE:
        return <VoicePanel />;
      case ViewType.IMAGE:
        return <ImageGenerator />;
      case ViewType.TASKS:
        return (
          <div className="h-full flex items-center justify-center bg-zinc-950">
            <div className="text-center space-y-4">
               <Zap size={48} className="mx-auto text-indigo-500 animate-pulse" />
               <h2 className="text-2xl font-bold brand">Nexus Tasks Coming Soon</h2>
               <p className="text-zinc-500 max-w-xs mx-auto">We're building an integrated productivity suite into Nexus. Stay tuned for advanced scheduling and task automation.</p>
            </div>
          </div>
        );
      default:
        return <ChatWindow user={user} />;
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        onLogout={handleLogout}
      />
      
      <main className="flex-1 flex flex-col relative">
        {/* Universal Header */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-widest text-zinc-400 uppercase hidden sm:block">
              {currentView === ViewType.CHAT && 'Intelligent Assistant'}
              {currentView === ViewType.VOICE && 'Voice Interaction'}
              {currentView === ViewType.IMAGE && 'Creative Studio'}
              {currentView === ViewType.TASKS && 'Productivity HUB'}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-full px-4 py-1.5 text-xs text-zinc-500">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                Gemini Lite High Speed
             </div>
             
             <div className="flex items-center gap-1 border-l border-zinc-800 ml-2 pl-2">
               <button className="p-2 text-zinc-400 hover:text-white transition-colors relative">
                 <Bell size={20} />
                 <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full border-2 border-zinc-950" />
               </button>
               <button className="p-2 text-zinc-400 hover:text-white transition-colors">
                 <Search size={20} />
               </button>
               <div className="ml-2 flex items-center gap-2 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-full">
                 <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                   {user.name.charAt(0)}
                 </div>
                 <span className="text-xs font-medium text-zinc-300 pr-1">{user.name}</span>
               </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
