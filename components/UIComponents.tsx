
import React from 'react';
import { COLORS } from '../constants';

export const Card = ({ children, className = "", ...props }: any) => (
  <div className={`bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border-2 border-gray-100 card-print ${className}`} {...props}>
    {children}
  </div>
);

export const Button = ({ onClick, children, variant = "primary", className = "", disabled = false }: any) => {
  const base = "px-8 py-4 rounded-2xl font-black transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-md no-print ";
  const variants: any = {
    primary: `text-white hover:shadow-2xl hover:shadow-burgundy-200/50`,
    secondary: `bg-gray-100 text-gray-900 border-2 border-gray-200 hover:bg-gray-200`,
    outline: `border-2 border-burgundy-600 text-burgundy-600 hover:bg-burgundy-50`,
    admin: `bg-amber-100 text-amber-900 border-2 border-amber-300 hover:bg-amber-200`
  };
  const style = variant === 'primary' ? { backgroundColor: COLORS.PRIMARY } : {};
  return (
    <button onClick={onClick} disabled={disabled} className={base + variants[variant] + " " + className} style={style}>
      {children}
    </button>
  );
};

export const VoiceButton = ({ onTranscription }: { onTranscription: (text: string) => void }) => {
  const [isListening, setIsListening] = React.useState(false);

  const startListening = React.useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Ihr Browser unterstützt keine Sprachaufnahme.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'de-DE';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscription(transcript);
    };

    recognition.start();
  }, [onTranscription]);

  return (
    <button
      type="button"
      onClick={startListening}
      className={`p-3 rounded-full border-2 transition-all no-print ${isListening ? 'bg-red-500 text-white animate-pulse border-red-200' : 'bg-white text-gray-400 border-gray-200 hover:text-primary hover:border-primary'}`}
      title="Diktieren"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
      </svg>
    </button>
  );
};

interface TooltipProps {
  content: string;
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, className = "" }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={() => setIsVisible(!isVisible)} // Mobile fallback
    >
      <div
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold cursor-help transition-all hover:scale-110"
        style={{ backgroundColor: COLORS.GOLD, color: COLORS.WHITE }}
      >
        ?
      </div>
      {isVisible && (
        <div
          className="absolute z-50 top-[-10px] left-[30px] bg-gray-900 text-white p-3 rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 duration-200 md:left-[30px] max-md:right-[30px] max-md:left-auto"
          style={{ width: '300px', fontSize: '0.85rem', lineHeight: '1.4' }}
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 top-3 -left-1" />
        </div>
      )}
    </div>
  );
};

interface InfoBoxProps {
  title: string;
  children: React.ReactNode;
  variant?: 'gold' | 'green';
}

export const InfoBox: React.FC<InfoBoxProps> = ({ title, children, variant = 'gold' }) => {
  const bgColor = variant === 'gold' ? 'rgba(142, 109, 47, 0.08)' : 'rgba(6, 95, 70, 0.05)';
  const borderColor = variant === 'gold' ? COLORS.GOLD : COLORS.SUCCESS;
  const titleColor = variant === 'gold' ? COLORS.GOLD : COLORS.SUCCESS;

  return (
    <div
      className="rounded-2xl p-5 border-2 mb-8"
      style={{ backgroundColor: bgColor, borderColor }}
    >
      <div className="font-bold text-base mb-2" style={{ color: titleColor }}>
        {title}
      </div>
      <div className="text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
};
