
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { chatService } from '../services/gemini';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  Loader2, 
  User, 
  Bot,
  Globe,
  X,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface ChatWindowProps {
  user: {
    email: string;
    name: string;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ user }) => {
  const historyKey = `nexus_history_${user.email}`;
  
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(historyKey);
    return saved ? JSON.parse(saved) : [
      { 
        id: '1', 
        role: 'model', 
        content: `Hello ${user.name}! I'm Nexus, your AI companion. How can I assist you today?`, 
        timestamp: Date.now(), 
        type: 'text' 
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<{data: string, mimeType: string} | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persistence effect
  useEffect(() => {
    localStorage.setItem(historyKey, JSON.stringify(messages));
  }, [messages, historyKey]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAttachedImage({
          data: base64,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !attachedImage) || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text',
      imageUrl: attachedImage ? `data:${attachedImage.mimeType};base64,${attachedImage.data}` : undefined
    };

    setMessages(prev => [...prev, userMsg]);
    const currentInput = input;
    const currentImg = attachedImage;
    setInput('');
    setAttachedImage(null);
    setLoading(true);

    try {
      const result = await chatService.sendMessage(currentInput || "Analyze this image", messages, currentImg || undefined);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: result.text,
        timestamp: Date.now(),
        type: 'text',
        sources: result.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        content: "Error: Failed to connect to Gemini. Please check your network or API configuration.",
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      const initialMessage: Message = { 
        id: Date.now().toString(), 
        role: 'model', 
        content: `History cleared. How can I help you now, ${user.name}?`, 
        timestamp: Date.now(), 
        type: 'text' 
      };
      setMessages([initialMessage]);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 relative">
      {/* Chat Actions Header */}
      <div className="px-4 py-2 flex justify-end gap-2 bg-zinc-950/40 backdrop-blur-sm border-b border-zinc-900/50 absolute top-0 left-0 right-0 z-10">
        <button 
          onClick={clearHistory}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all group"
          title="Clear Conversation"
        >
          <Trash2 size={14} className="group-hover:scale-110 transition-transform" />
          Clear Chat
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto pt-16 p-4 md:p-8 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center border ${
              msg.role === 'user' ? 'bg-indigo-600 border-indigo-500' : 'bg-zinc-800 border-zinc-700'
            }`}>
              {msg.role === 'user' ? <User size={20} /> : <Bot size={20} className="text-indigo-400" />}
            </div>
            
            <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
              <div className={`p-4 rounded-2xl border ${
                msg.role === 'user' 
                  ? 'bg-indigo-600/10 border-indigo-500/30 text-zinc-100' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-200'
              } shadow-lg whitespace-pre-wrap leading-relaxed`}>
                {msg.imageUrl && (
                  <img src={msg.imageUrl} alt="Uploaded content" className="rounded-lg mb-3 max-w-full h-auto border border-white/10" />
                )}
                {msg.content}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {msg.sources.map((src, i) => (
                    src.web && (
                      <a 
                        key={i} 
                        href={src.web.uri} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-full text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
                      >
                        <Globe size={12} />
                        <span className="truncate max-w-[150px]">{src.web.title || 'Source'}</span>
                      </a>
                    )
                  ))}
                </div>
              )}
              
              <div className={`text-[10px] text-zinc-600 font-medium px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <Loader2 className="animate-spin text-zinc-500" size={20} />
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl w-24">
              <div className="flex space-x-1">
                <div className="h-2 w-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="h-2 w-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="h-2 w-2 bg-zinc-700 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800">
        <div className="max-w-4xl mx-auto">
          {attachedImage && (
            <div className="mb-3 relative inline-block">
              <img 
                src={`data:${attachedImage.mimeType};base64,${attachedImage.data}`} 
                alt="Preview" 
                className="h-20 w-20 object-cover rounded-lg border-2 border-indigo-500 shadow-xl"
              />
              <button 
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-zinc-900 text-white rounded-full p-1 border border-zinc-700 hover:bg-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <div className="relative group flex items-end gap-2">
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-inner-lg focus-within:border-indigo-500/50 transition-all duration-300">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Nexus anything..."
                className="w-full bg-transparent p-4 outline-none resize-none text-zinc-200 placeholder-zinc-600 min-h-[56px] max-h-48"
                rows={1}
              />
              
              <div className="flex items-center justify-between px-4 pb-3 border-t border-zinc-800/50 mt-1 pt-2">
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
                    title="Upload Image"
                  >
                    <ImageIcon size={20} />
                  </button>
                  <button className="p-2 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors" title="Attach File">
                    <Paperclip size={20} />
                  </button>
                </div>
                
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !attachedImage) || loading}
                  className={`p-2 rounded-xl transition-all shadow-md ${
                    (!input.trim() && !attachedImage) || loading
                      ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 active:scale-95'
                  }`}
                >
                  <Send size={20} className={loading ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] text-zinc-600 mt-4 font-medium uppercase tracking-widest">
            Powered by Gemini Lite • Real-time Scoped Persistence
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
