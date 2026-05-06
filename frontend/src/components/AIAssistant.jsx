import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';

// 🚀 FEATURE FLAG: Toggle this to true when you want to reactivate the chatbot.
// For production, you'd eventually move this to: import.meta.env.VITE_ENABLE_AI_COACH
const IS_CHATBOT_ENABLED = false;

export default function AIAssistant({ onClose, context = '' }) {
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: IS_CHATBOT_ENABLED 
        ? "Hi! I'm your AI career coach. Ask me anything about interviews, resumes, or how to improve your answers!"
        : "Hi! I'm your AI Career Coach 🚀\n\nThis feature is currently under development and will be available soon. Stay tuned!"
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!IS_CHATBOT_ENABLED || !input.trim() || loading) return;
    
    const userMsg = { role: 'user', content: input };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { messages: newMessages, context });
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch {
      toast.error('Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg glass-dark rounded-2xl flex flex-col overflow-hidden shadow-2xl shadow-brand-900/30 border border-brand-500/20 h-[600px]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${IS_CHATBOT_ENABLED ? 'bg-linear-to-br from-brand-500 to-accent-teal' : 'bg-slate-700'}`}>
              <Bot size={16} className="text-white" />
            </div>
            <div>
              <p className="font-display font-semibold text-white text-sm">AI Career Coach</p>
              <p className={`text-xs ${IS_CHATBOT_ENABLED ? 'text-accent-teal' : 'text-slate-400'}`}>
                {IS_CHATBOT_ENABLED ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' ? 'bg-brand-600/30' : (IS_CHATBOT_ENABLED ? 'bg-accent-teal/20' : 'bg-slate-700/50')
              }`}>
                {msg.role === 'user' ? (
                  <User size={13} className="text-brand-400" />
                ) : (
                  <Bot size={13} className={IS_CHATBOT_ENABLED ? "text-accent-teal" : "text-slate-400"} />
                )}
              </div>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-brand-600/20 border border-brand-500/20 text-slate-200 rounded-tr-sm'
                  : 'bg-white/5 border border-white/5 text-slate-300 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-accent-teal/20 flex items-center justify-center">
                <Bot size={13} className="text-accent-teal" />
              </div>
              <div className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-sm">
                <Loader2 size={16} className="text-accent-teal animate-spin" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={IS_CHATBOT_ENABLED ? "Ask anything..." : "Chatbot is temporarily offline..."}
              disabled={!IS_CHATBOT_ENABLED}
              className="input-field flex-1 py-2.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!IS_CHATBOT_ENABLED || !input.trim() || loading}
              className="btn-primary px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}