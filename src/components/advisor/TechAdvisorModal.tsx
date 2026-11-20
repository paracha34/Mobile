import React, { useState } from 'react';
import { Bot, BrainCircuit, Sparkles, Send, X, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TechAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_QUERIES = [
  "Galaxy S25 Ultra vs iPhone 16 Pro Max camera & performance breakdown",
  "Top ANC headphones for quiet focus under PKR 100,000",
  "Compare Apple Watch Ultra 2 with Galaxy Watch Ultra for battery & sports",
  "Best high-wattage travel charger and power bank setup"
];

export const TechAdvisorModal: React.FC<TechAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am your Gadget Zone Tech Advisor, powered by high-reasoning Gemini intelligence. Whether you need a deep architectural comparison between flagship processors, advice on acoustic noise cancellation, or picking the optimal gadget for your budget, ask away!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.slice(-4),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get advisor recommendations');
      }

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.reply || "I analyzed your requirements. Check out our Flagship Smartphones and Audio categories for optimal matches!",
        },
      ]);
    } catch {
      // Fallback expert advice if offline or endpoint unreachable
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `Here is our expert analysis: If your priority is cinematic zoom photography and desktop multitasking with the S-Pen, the **Samsung Galaxy S25 Ultra** is unbeatable. For supreme video recording consistency, social media optimization, and longevity, the **iPhone 16 Pro Max** leads. For pure audio silence, the **Sony WH-1000XM5** offers superior passive seal and dual-processor active noise canceling. You can explore all these models in our catalog!`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#12121a] border border-[#2a2a3e] rounded-2xl shadow-2xl flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#2a2a3e] bg-[#1a1a2e]/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Gadget Zone AI Advisor</h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-900/60 border border-purple-500/40 text-[10px] text-purple-300 font-medium">
                  <BrainCircuit className="w-3 h-3 text-purple-400" />
                  Thinking Mode High
                </span>
              </div>
              <p className="text-xs text-gray-400">Deep technical comparisons &amp; personalized buying guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/50 flex items-center justify-center text-purple-400 shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-[#1a1a2e] text-gray-200 border border-[#2a2a3e] rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-gray-400 text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 animate-pulse">
                <BrainCircuit className="w-3.5 h-3.5 animate-spin" />
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a2e] px-3 py-2 rounded-xl border border-[#2a2a3e]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" />
                <span>Deep thinking &amp; specs analysis in progress...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset prompts */}
        <div className="px-4 py-2 border-t border-[#2a2a3e]/50 bg-[#0a0a0f]/40 flex gap-1.5 overflow-x-auto no-scrollbar">
          {PRESET_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="whitespace-nowrap px-2.5 py-1 rounded-full bg-[#1a1a2e] hover:bg-purple-900/40 border border-[#2a2a3e] hover:border-purple-500/40 text-[11px] text-gray-300 transition-colors shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-[#2a2a3e] bg-[#1a1a2e]/60 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="Ask about phones, specs, battery life, audio, or deals..."
            className="flex-1 bg-[#12121a] border border-[#2a2a3e] focus:border-purple-500 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
