import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../types';
import { GoogleGenAI } from '@google/genai';

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Hello Alex! I am your LifeFlow AI Life Coach. I can help you plan your daily schedule, analyze your financial savings rate, suggest healthy meal plans, or break down long-term goals. How can I assist you today?',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input;
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check if GEMINI_API_KEY is available or if we use intelligent simulated response
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
      
      let replyText = "";
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are LifeFlow AI, an expert personal life coach and productivity assistant. The user asks: "${userMsgText}". Provide a concise, highly practical, encouraging response focused on personal organization, wellbeing, and goals.`
        });
        replyText = response.text || "I'm here to help you organize your life and live better.";
      } else {
        // Intelligent fallback response
        await new Promise(r => setTimeout(r, 800));
        const lower = userMsgText.toLowerCase();
        if (lower.includes('budget') || lower.includes('finance')) {
          replyText = "Your net cashflow looks healthy ($6,410 positive this month). Consider allocating 20% of surplus towards your global index fund milestone.";
        } else if (lower.includes('routine') || lower.includes('habit')) {
          replyText = "Your 14-day morning mindfulness streak is excellent! To compound your progress, ensure you lock in your evening digital sunset at 8:00 PM.";
        } else if (lower.includes('task') || lower.includes('plan')) {
          replyText = "Let's focus on your top 3 priority tasks today. Start with 'Review Q1 Global Strategy' before 2 PM, then transition to deep work.";
        } else {
          replyText = `That is a wonderful objective regarding "${userMsgText}". Remember the LifeFlow principle: small daily habits compound into extraordinary life outcomes. Would you like me to create a task checklist for this?`;
        }
      }

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: 'I encountered a brief connection glitch, but remember: keep prioritizing your core routines and daily health goals!',
        timestamp: 'Just now'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#123D32]">LifeFlow AI Life Coach</h2>
          <p className="text-xs text-neutral-500">Your intelligent companion for daily planning, finance insights, and habit optimization.</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#C5A45D]/20 text-[#123D32] flex items-center justify-center font-bold">
          <Bot className="w-5 h-5" />
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-col h-[550px] overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-[#123D32] text-white' : 'bg-[#C5A45D] text-[#123D32] font-bold'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-[#123D32] text-white rounded-tr-xs' 
                  : 'bg-neutral-100 text-neutral-800 rounded-tl-xs'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] block mt-1.5 font-mono ${msg.sender === 'user' ? 'text-white/70 text-right' : 'text-neutral-400'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#C5A45D] text-[#123D32] flex items-center justify-center font-bold">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-neutral-100 text-neutral-500 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-[#123D32]" />
                <span>LifeFlow AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-neutral-50 border-t border-[#E9ECE8] flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI coach for scheduling help, habit tips, or budget review..."
            className="flex-1 px-4 py-3 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-900 focus:outline-none focus:border-[#123D32]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-[#123D32] text-white rounded-xl font-medium text-sm hover:bg-[#1a5244] transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Quick Prompt Starters */}
      <div className="flex flex-wrap gap-2">
        <button 
          onClick={() => setInput("Plan my optimal schedule for tomorrow")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          💡 Plan my optimal schedule for tomorrow
        </button>
        <button 
          onClick={() => setInput("Analyze my monthly budget & savings")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          📊 Analyze my monthly budget & savings
        </button>
        <button 
          onClick={() => setInput("How to maintain 14-day habit streak?")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          🔥 How to maintain 14-day habit streak?
        </button>
      </div>
    </div>
  );
};
