
import React from 'react';
import { ViewType } from '../types';
import { 
  MessageSquare, 
  Mic, 
  Image as ImageIcon, 
  CheckSquare, 
  Settings,
  Zap,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, onLogout }) => {
  const menuItems = [
    { id: ViewType.CHAT, label: 'Assistant', icon: MessageSquare },
    { id: ViewType.VOICE, label: 'Voice Chat', icon: Mic },
    { id: ViewType.IMAGE, label: 'Studio', icon: ImageIcon },
    { id: ViewType.TASKS, label: 'Tasks', icon: CheckSquare },
  ];

  return (
    <aside className="w-20 md:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Zap className="text-white w-6 h-6 fill-current" />
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight brand">NEXUS</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
              currentView === item.id 
                ? 'bg-zinc-900 text-indigo-400 shadow-sm border border-zinc-800' 
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50'
            }`}
          >
            <item.icon className={`w-5 h-5 ${currentView === item.id ? 'text-indigo-400' : ''}`} />
            <span className="hidden md:block font-medium">{item.label}</span>
            {currentView === item.id && (
              <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-zinc-900 space-y-1">
        <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/50 transition-all">
          <Settings className="w-5 h-5" />
          <span className="hidden md:block font-medium">Settings</span>
        </button>
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden md:block font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
