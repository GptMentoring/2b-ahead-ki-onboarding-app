
import React, { useEffect, useState } from 'react';
import { COLORS } from '../../constants';

interface LevelUpCelebrationProps {
  previousLevel: number;
  newLevel: number;
  newLevelName: string;
  type: 'ki' | 'zukunft';
  onClose: () => void;
}

// Generiere Konfetti-Partikel mit zufaelligen Eigenschaften
const CONFETTI_COUNT = 25;
const CONFETTI_COLORS = ['#64162D', '#1E3A5F', '#065F46', '#8E6D2F', '#E11D48', '#3B82F6', '#10B981', '#F59E0B'];

interface ConfettiParticle {
  id: number;
  left: number;       // % von links
  delay: number;      // Sekunden Verzoegerung
  duration: number;   // Sekunden Falldauer
  size: number;       // px
  color: string;
  rotation: number;   // Grad
  shape: 'square' | 'circle';
}

function generateConfetti(): ConfettiParticle[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 2 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }));
}

// Top-X% Motivation basierend auf neuem Level
function getMotivation(level: number): string {
  if (level >= 8) return 'Du gehoerst zu den Top 5% der KI-Anwender!';
  if (level >= 6) return 'Du gehoerst zu den Top 15% der KI-Anwender!';
  if (level >= 4) return 'Du gehoerst zu den Top 30% — starker Fortschritt!';
  if (level >= 3) return 'Weiter so — du baust echte KI-Kompetenz auf!';
  return 'Grossartig — der erste Schritt ist der wichtigste!';
}

const LevelUpCelebration: React.FC<LevelUpCelebrationProps> = ({
  previousLevel,
  newLevel,
  newLevelName,
  type,
  onClose,
}) => {
  const [confetti] = useState(() => generateConfetti());
  const [visible, setVisible] = useState(true);

  const color = type === 'ki' ? COLORS.PRIMARY : COLORS.ZUKUNFT;
  const label = type === 'ki' ? 'KI Readiness' : 'Zukunft Readiness';

  // Auto-close nach 8 Sekunden
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // kurz warten fuer Fade-Out
    }, 8000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={handleClose}
    >
      {/* Konfetti CSS */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes level-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes arrow-bounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(6px); }
        }
        .confetti-particle {
          position: fixed;
          top: -20px;
          animation: confetti-fall linear forwards;
          pointer-events: none;
          z-index: 51;
        }
        .level-number-pulse {
          animation: level-pulse 1.5s ease-in-out infinite;
        }
        .arrow-bounce {
          animation: arrow-bounce 1s ease-in-out infinite;
          display: inline-block;
        }
      `}</style>

      {/* Konfetti-Partikel */}
      {confetti.map((p) => (
        <div
          key={p.id}
          className="confetti-particle"
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}

      {/* Center Card */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-md w-full mx-4 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji */}
        <div className="text-5xl mb-4">&#127881;</div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2" style={{ color }}>
          LEVEL UP!
        </h2>

        {/* Typ-Label */}
        <div className="text-[10px] font-black uppercase tracking-[0.3em] mb-6" style={{ color: `${color}99` }}>
          {label}
        </div>

        {/* Level Transition */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black opacity-50"
              style={{ backgroundColor: color }}
            >
              {previousLevel}
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1">Vorher</span>
          </div>

          <span className="arrow-bounce text-2xl font-black" style={{ color }}>
            &#10132;
          </span>

          <div className="flex flex-col items-center">
            <div
              className="level-number-pulse w-14 h-14 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg"
              style={{ backgroundColor: color }}
            >
              {newLevel}
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1">Jetzt</span>
          </div>
        </div>

        {/* Neuer Level-Name */}
        <div
          className="text-2xl md:text-3xl font-black mb-3"
          style={{ color }}
        >
          {newLevelName.toUpperCase()}
        </div>

        {/* Motivation */}
        <p className="text-sm font-bold text-gray-500 mb-8">
          {getMotivation(newLevel)}
        </p>

        {/* Weiter Button */}
        <button
          onClick={handleClose}
          className="px-8 py-3 rounded-xl text-white font-black text-sm uppercase tracking-wider transition-all duration-200 hover:opacity-90 hover:shadow-lg"
          style={{ backgroundColor: color }}
        >
          Weiter
        </button>
      </div>
    </div>
  );
};

export default LevelUpCelebration;
