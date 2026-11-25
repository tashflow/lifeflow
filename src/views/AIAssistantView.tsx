import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, ShieldCheck } from 'lucide-react';
import { ChatMessage } from '../types';

export const AIAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: 'Welcome to the LifeFlow Planning Coach. I provide offline-safe suggestions for organizing your schedule, habits, budgets, and goals without sending your data to external AI APIs.',
      timestamp: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsgText = input.trim();
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
      // Spark Free security design: keep guidance strictly local without client-side API keys (AUD-G-01).
      await new Promise(r => setTimeout(r, 350));
      const lower = userMsgText.toLowerCase();
      let replyText = '';
      if (lower.includes('budget') || lower.includes('finance') || lower.includes('saving')) {
        replyText = 'Review your recent entries in the Finance Ledger tab: tag fixed vs. discretionary expenses first, then allocate a recurring percentage target toward your Wealth goals.';
      } else if (lower.includes('routine') || lower.includes('habit') || lower.includes('streak')) {
        replyText = 'Anchor each new habit to an existing daily cue (Morning, Afternoon, or Evening) in the Habits & Routines view, and protect consistency by keeping daily targets realistic.';
      } else if (lower.includes('task') || lower.includes('plan') || lower.includes('schedule')) {
        replyText = 'Pick up to 3 High-priority tasks in Task Flow for today, time-block them in Calendar, and clear smaller errands into one batch window.';
      } else {
        replyText = `For "${userMsgText}", try breaking the objective into 1 concrete milestone in Life Goals and 2 actionable items in Task Flow so progress stays measurable.`;
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
        text: 'Could not generate local guidance right now. Check your Task Flow and Habits tabs directly.',
        timestamp: 'Just now'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in pb-12 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-[#E9ECE8] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-[#123D32]">LifeFlow Planning Coach</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#123D32] border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> Local Offline Mode (No Client API Keys)
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">Rule-based planning tips running entirely in your browser to keep private notes and credentials off external servers.</p>
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
              className={`flex gap-3 max-w-xl ${msg.sender === 'user' ? 'ms-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user' ? 'bg-[#123D32] text-white' : 'bg-[#C5A45D] text-[#123D32] font-bold'
              }`}>
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm ${
                msg.sender === 'user' 
                  ? 'bg-[#123D32] text-white' 
                  : 'bg-neutral-100 text-neutral-800'
              }`}>
                <p className="leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] block mt-1.5 font-mono ${msg.sender === 'user' ? 'text-white/70 text-end' : 'text-neutral-400'}`}>
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
                <span>Preparing suggestion...</span>
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
            placeholder="Ask for scheduling tips, habit cues, or budget review steps..."
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
          type="button"
          onClick={() => setInput("Plan my optimal schedule for tomorrow")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          Plan my optimal schedule for tomorrow
        </button>
        <button 
          type="button"
          onClick={() => setInput("Analyze my monthly budget & savings")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          Analyze my monthly budget & savings
        </button>
        <button 
          type="button"
          onClick={() => setInput("How to maintain a daily habit streak?")}
          className="px-3.5 py-2 bg-white border border-[#E9ECE8] rounded-xl text-xs font-medium text-neutral-700 hover:border-[#123D32] transition-all"
        >
          How to maintain a daily habit streak?
        </button>
      </div>
    </div>
  );
};
