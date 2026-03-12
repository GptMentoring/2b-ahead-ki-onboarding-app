
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { User, Analysis } from './types';
import { dbService } from './services/dbService';

// Import Views
import LoginView from './components/LoginView';
import AssessmentView from './components/AssessmentView';
import DashboardView from './components/DashboardView';
import QuickWinView from './components/QuickWinView';
import AdminPanelView from './components/AdminPanelView';
import MentorView from './components/MentorView';
import Layout from './components/Layout';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('2bahead_session_email');
    if (stored) {
      dbService.getUser(stored).then(async (u) => {
        if (u) {
          setUser(u);
          const ana = await dbService.getAnalysis(u.uid);
          setAnalysis(ana);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('2bahead_session_email', u.email);
    dbService.getAnalysis(u.uid).then(setAnalysis);
  };

  const handleLogout = () => {
    localStorage.removeItem('2bahead_session_email');
    setUser(null);
    setAnalysis(null);
    window.location.hash = '/';
  };

  const handleAssessmentComplete = async (ana: Analysis) => {
    setAnalysis(ana);
    const updatedUser = { ...user!, assessmentCompleted: true };
    await dbService.saveUser(updatedUser);
    setUser(updatedUser);
    window.location.hash = '/';
  };

  // FIX S4: Loading-Text von Entwickler-Sprache zu User-Sprache geändert
  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-black text-primary">Dein Profil wird geladen...</div>;
  if (!user) return <LoginView onLogin={handleLogin} />;

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={
            /* FIX S3: Der CTA zur Ist-Analyse ("NEUES ASSESSMENT") befindet sich in
               components/DashboardView.tsx Zeile ~82. Dort sollte der Text geändert werden zu:
               CTA-Text: "10 Min. → Dein persönlicher KI-Fahrplan"
               Sub-Text: "Beantworte 6 kurze Module und erhalte Tool-Empfehlungen, passende Use Cases und deinen optimalen Session-Plan."
            */
            user.assessmentCompleted && analysis ? (
              <DashboardView user={user} analysis={analysis} onRepeat={() => {
                const u = { ...user, assessmentCompleted: false };
                setUser(u);
                dbService.saveUser(u);
              }} />
            ) : (
              <AssessmentView user={user} onComplete={handleAssessmentComplete} />
            )
          } />
          <Route path="/quickwin" element={<QuickWinView analysis={analysis} />} />
          <Route path="/admin" element={user.isAdmin ? <AdminPanelView /> : <Navigate to="/" />} />
          <Route path="/mentor" element={<MentorView />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
