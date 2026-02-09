
import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { dbService } from '../services/dbService';
import { LOGO_URL } from '../constants';
import { Card, Button } from './UIComponents';

interface LoginViewProps {
  onLogin: (u: User) => void;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Admin Mode States
  const [isAdminView, setIsAdminView] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogin = async (asAdmin = false) => {
    setError(null);
    setIsLoading(true);
    
    try {
      const loginEmail = email.trim().toLowerCase();
      const adminKeyInput = password.trim();
      
      if (!loginEmail || !loginEmail.includes('@')) {
        setError("Bitte geben Sie eine gültige E-Mail Adresse ein.");
        setIsLoading(false);
        return;
      }

      // Strikte Domain-Prüfung NUR für Admin-Zugriff
      if (asAdmin && !loginEmail.endsWith('@2bahead.com')) {
        setError("Admin-Zugriff nur für @2bahead.com Domains gestattet.");
        setIsLoading(false);
        return;
      }

      // Admin Key Check (Case Sensitive, but trimmed)
      const expectedAdminKey = process.env.ADMIN_KEY || '2bahead2025';
      if (asAdmin && adminKeyInput !== expectedAdminKey) {
        setError("Ungültiger Admin-Key. Registrierung/Login fehlgeschlagen.");
        setIsLoading(false);
        return;
      }

      const existingUser = await dbService.getUser(loginEmail);
      
      if (existingUser) {
        // Falls ein normaler User versucht sich als Admin einzuloggen ohne Admin-Rechte
        if (asAdmin && !existingUser.isAdmin) {
          setError("Dieser Account ist bereits als Teilnehmer registriert, verfügt aber über keine Administrator-Rechte.");
          setIsLoading(false);
          return;
        }
        onLogin(existingUser);
      } else {
        // Registrierung neuer User
        if (!firstName.trim() || !lastName.trim()) {
          setError("Bitte geben Sie Vor- und Nachnamen für die Registrierung an.");
          setIsLoading(false);
          return;
        }

        const newUser: User = {
          uid: 'u-' + Math.random().toString(36).substr(2, 9),
          email: loginEmail,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: asAdmin ? Role.PM : Role.OWNER,
          createdAt: Date.now(),
          lastLogin: Date.now(),
          assessmentCompleted: false,
          quickWinCompleted: false,
          isAdmin: asAdmin
        };
        await dbService.saveUser(newUser);
        onLogin(newUser);
      }
    } catch (e) {
      console.error("Login Error:", e);
      setError("Ein unerwarteter Fehler ist aufgetreten.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoClick = () => {
    const newCount = logoClicks + 1;
    if (newCount >= 3) {
      setIsAdminView(true);
      setLogoClicks(0);
      setError(null);
    } else {
      setLogoClicks(newCount);
      const timer = setTimeout(() => setLogoClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-burgundy-50 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-amber-50 rounded-full blur-[120px] opacity-30"></div>
      
      <Card className="max-w-md w-full p-12 z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-12">
          <img 
            src={LOGO_URL} 
            alt="2b AHEAD" 
            className="h-10 cursor-pointer select-none active:scale-95 transition-transform" 
            onClick={handleLogoClick}
            title="Hidden Admin Access"
          />
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black tracking-tight mb-2 text-gray-900">
            {isAdminView ? 'Admin Portal' : 'KI-Onboarding'}
          </h1>
          <p className={`text-[10px] font-black uppercase tracking-widest ${isAdminView ? 'text-amber-600' : 'text-gray-500'}`}>
            {isAdminView ? 'Registrierung & Login für Admins (@2bahead.com)' : 'Registrierung & Login'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-100 rounded-2xl text-rose-700 text-[11px] font-black uppercase text-center animate-in slide-in-from-top-2">
            {error}
          </div>
        )}
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Geschäftliche E-Mail</label>
            <input
              type="email"
              className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 transition-all text-sm font-black text-gray-900 ${isAdminView ? 'border-amber-100 focus:border-amber-500 focus:ring-amber-50' : 'border-gray-200 focus:border-burgundy-600 focus:ring-burgundy-50'}`}
              placeholder={isAdminView ? "admin@2bahead.com" : "deine@email.de"}
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          
          {isAdminView && (
            <div className="space-y-2 animate-in slide-in-from-bottom-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Admin Key</label>
              <input 
                type="password" 
                className="w-full px-5 py-4 bg-white border-2 border-amber-200 rounded-2xl outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-50 transition-all text-sm font-black text-gray-900"
                placeholder="Sicherheits-Key eingeben"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest ml-1">Erforderlich für Admin-Berechtigungen</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-2">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Vorname</label>
              <input 
                type="text" 
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 transition-all text-sm font-black text-gray-900 ${isAdminView ? 'border-amber-100 focus:border-amber-500 focus:ring-amber-50' : 'border-gray-200 focus:border-burgundy-600 focus:ring-burgundy-50'}`}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Vorname"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nachname</label>
              <input 
                type="text" 
                className={`w-full px-5 py-4 bg-white border-2 rounded-2xl outline-none focus:ring-4 transition-all text-sm font-black text-gray-900 ${isAdminView ? 'border-amber-100 focus:border-amber-500 focus:ring-amber-50' : 'border-gray-200 focus:border-burgundy-600 focus:ring-burgundy-50'}`}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Nachname"
              />
            </div>
          </div>
          
          <div className="pt-4 space-y-4">
            <Button 
              onClick={() => handleLogin(isAdminView)} 
              className={`w-full shadow-xl ${isAdminView ? 'bg-amber-600 hover:bg-amber-700 border-amber-500' : ''}`} 
              disabled={isLoading}
            >
              {isLoading ? 'VERIFIZIERE...' : (isAdminView ? 'Admin Account erstellen/login' : 'Programm starten')}
            </Button>
            
            {isAdminView ? (
              <button 
                onClick={() => { setIsAdminView(false); setError(null); }}
                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors"
              >
                Zurück zum Teilnehmer-Login
              </button>
            ) : (
              <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-[0.3em] pt-2">
                Digital Foundation for AI Mentoring
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default LoginView;
