
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';
import { LOGO_URL } from '../constants';
import AIHelpAgent from './AIHelpAgent';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen bg-[#FDFCFD] flex flex-col font-sans text-gray-900">
      <nav className="bg-white/95 backdrop-blur-xl border-b-2 border-gray-100 sticky top-0 z-40 transition-all shadow-md no-print">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between h-24 items-center">
            <div className="flex items-center gap-10">
              <Link to="/" className="hover:opacity-80 transition-opacity"><img src={LOGO_URL} alt="2b AHEAD" className="h-7" /></Link>
              <div className="h-8 w-[2px] bg-gray-300 hidden md:block"></div>
              <div className="hidden md:flex flex-col">
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] leading-none mb-1">Mentoring Platform</span>
                <span className="text-[12px] font-black text-gray-800 tracking-tight">V 2.9 • Modulare Architektur</span>
              </div>
            </div>
            <div className="flex items-center gap-10">
              {user.isAdmin && (
                <Link to="/admin" className="text-[11px] font-black text-amber-900 uppercase tracking-widest px-6 py-3 bg-amber-100 rounded-full hover:bg-amber-200 transition-all border-2 border-amber-300 shadow-sm">
                   Admin Dashboard
                </Link>
              )}
              <div className="flex items-center gap-6 border-l-2 border-gray-100 pl-10">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-black leading-none mb-1 text-gray-900">{user.firstName} {user.lastName}</p>
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">{user.role}</p>
                </div>
                <button onClick={onLogout} className="w-12 h-12 bg-gray-100 border-2 border-gray-200 rounded-2xl flex items-center justify-center hover:bg-rose-100 hover:text-rose-700 transition-all text-gray-600 active:scale-95 shadow-sm">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">
        {children}
      </main>
      <div className="no-print">
        <AIHelpAgent context={`User: ${user.firstName}, Admin: ${user.isAdmin}, Status: ${user.assessmentCompleted ? 'Fertig' : 'Assessment'}`} />
      </div>
    </div>
  );
};

export default Layout;
