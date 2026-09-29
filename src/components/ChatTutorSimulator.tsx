import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  Smartphone, 
  CheckCheck, 
  RotateCcw,
  Loader2,
  Calendar,
  Flame,
  MessageSquare
} from 'lucide-react';
import { Question } from '../types/math';
import MathView from './MathView';

interface ChatTutorSimulatorProps {
  currentQuestion: Question;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
}

export const ChatTutorSimulator: React.FC<ChatTutorSimulatorProps> = ({ currentQuestion }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      text: `👋 Good morning, Scholar! Here is today's **JUPEB Question of the Day**:\n\n*Topic: ${currentQuestion.topic} (${currentQuestion.subtopic})*\n\n"${currentQuestion.question_text}"\n\nWhat is your first step for solving this? Reply here or tap one of the quick prompts below! 🎯`,
      timestamp: '08:00 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/gemini/chat-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          currentQuestion,
        }),
      });

      const data = await res.json();
      const botMsg: Message = {
        id: 'msg_bot_' + Date.now(),
        sender: 'bot',
        text: data.reply || "Good reasoning! Keep continuing your derivation step-by-step.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: 'msg_bot_err_' + Date.now(),
        sender: 'bot',
        text: `Nice attempt! Remember: For this problem on ${currentQuestion.topic}, focus on the rule: $${currentQuestion.key_concept.split('$')[1] || 'y = f(x)'}$. Check the algebra carefully!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'Give me a hint for Step 1',
    'What formula should I apply first?',
    'What common pitfall should I avoid on this question?',
    'Show me the full final answer',
  ];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-indigo-400" />
          <span>
            <strong>Conversational Tutor Simulation:</strong> WhatsApp & Telegram mini-app preview for "Question of the Day".
          </span>
        </div>
        <button
          onClick={() => {
            setMessages([
              {
                id: 'm1',
                sender: 'bot',
                text: `👋 Here is your question of the day for ${currentQuestion.topic}:\n"${currentQuestion.question_text}"`,
                timestamp: '08:00 AM',
              },
            ]);
          }}
          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          Reset Chat
        </button>
      </div>

      {/* Mobile Device Frame */}
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[620px]">
        {/* Chat App Header (WhatsApp / Telegram style) */}
        <div className="bg-emerald-900/40 border-b border-emerald-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-white shadow">
                <Bot className="w-5 h-5" />
              </div>
              <div className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 absolute -bottom-0.5 -right-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <span>JUPEB Math Companion</span>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                  Verified Bot
                </span>
              </div>
              <div className="text-[11px] text-emerald-300/80">
                Online • Powered by Gemini AI
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily Streak: 3</span>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0b101b] bg-math-dots">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-md leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60'
                }`}
              >
                <MathView text={msg.text} />
                <div
                  className={`text-[10px] mt-1.5 flex items-center justify-end gap-1 ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'user' && <CheckCheck className="w-3 h-3 text-indigo-200" />}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-300 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span>JUPEB Companion is calculating response...</span>
              </div>
            </div>
          )}
          <div ref={scrollEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="p-2 border-t border-slate-800 bg-slate-950/80 overflow-x-auto flex items-center gap-1.5 no-scrollbar">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Type your answer, formula, or question..."
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-full px-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || isLoading}
            className="w-9 h-9 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shrink-0 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatTutorSimulator;
