
import React, { useState, useEffect, useRef } from 'react';
import { geminiService } from '../services/geminiService';
import { COLORS } from '../constants';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AIHelpAgent: React.FC<{ context?: string }> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Willkommen! Ich bin Ihr persönlicher KI-Lotse für das 2b AHEAD Programm. Wie kann ich Sie heute unterstützen?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const playAudio = async (text: string) => {
    setIsSpeaking(true);
    const buffer = await geminiService.speak(text);
    if (!buffer) {
      setIsSpeaking(false);
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    const ctx = audioContextRef.current;
    
    // Decoding PCM data manually as per Gemini guidelines
    const dataInt16 = new Int16Array(buffer);
    const audioBuffer = ctx.createBuffer(1, dataInt16.length, 24000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);
    source.onended = () => setIsSpeaking(false);
    source.start();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const response = await geminiService.getChatResponse(userMsg, context);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: response || '...' }]);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group border-4 border-white"
        style={{ backgroundColor: COLORS.PRIMARY }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white transition-transform group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-28 right-8 w-80 md:w-[400px] h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
          <div className="p-5 flex justify-between items-center text-white" style={{ background: `linear-gradient(135deg, ${COLORS.PRIMARY}, ${COLORS.PRIMARY_LIGHT})` }}>
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                   <span className="text-xl">🤖</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-primary rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-sm">KI Help-Agent</h3>
                <p className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">2b AHEAD Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FDFCFD]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`relative max-w-[85%] p-4 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  m.role === 'user' 
                  ? 'bg-[#EFE5E8] text-burgundy-900 rounded-tr-none' 
                  : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}>
                  {m.text}
                  {m.role === 'ai' && (
                    <button 
                      onClick={() => playAudio(m.text)}
                      className="absolute -right-10 top-0 p-2 text-gray-400 hover:text-primary transition-colors"
                      disabled={isSpeaking}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${isSpeaking ? 'animate-pulse text-primary' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-white">
            <div className="flex gap-3 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Wie funktioniert die 5-Säulen-Methodik?"
                className="flex-1 px-5 py-3 bg-gray-50 rounded-2xl text-[13px] border border-gray-100 focus:outline-none focus:ring-2 focus:ring-burgundy-100 focus:bg-white transition-all"
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center transition-all hover:scale-105"
                style={{ backgroundColor: COLORS.PRIMARY }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIHelpAgent;
