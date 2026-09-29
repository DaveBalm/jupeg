import React from 'react';
import { 
  Sparkles, 
  PenTool, 
  Flame, 
  BarChart2, 
  RotateCw, 
  MessageSquare, 
  Globe, 
  BookOpen,
  Plus,
  Sun,
  Moon
} from 'lucide-react';
import { UserProfile } from '../types/math';
import { useTheme } from '../context/ThemeContext';

export type ActiveTab = 'tutor' | 'dashboard' | 'srs' | 'chat' | 'seo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userProfile: UserProfile;
  srsDueCount: number;
  onOpenScratchpad: () => void;
  onOpenAiSolver: () => void;
  isScratchpadOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userProfile,
  srsDueCount,
  onOpenScratchpad,
  onOpenAiSolver,
  isScratchpadOpen,
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => setActiveTab('tutor')} 
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              ∫
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-extrabold text-white text-sm sm:text-base tracking-tight">
                <span>JUPEB</span>
                <span className="text-indigo-400">Math</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  A-Level
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Step-by-Step Mastery & SRS Platform
              </div>
            </div>
          </div>
        </div>

        {/* Center Tabs Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('tutor')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'tutor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Step Tutor</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Mastery Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('srs')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
              activeTab === 'srs'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>SRS Review</span>
            {srsDueCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Bot</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'seo'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>SEO Engine</span>
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Daily Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            <span>{userProfile.streak_days}d</span>
          </div>

          {/* AI Solver Trigger */}
          <button
            onClick={onOpenAiSolver}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all active:scale-95 shadow-sm"
            title="Compile or paste any JUPEB past question with Gemini"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Solver</span>
          </button>

          {/* Scratchpad Toggle */}
          <button
            onClick={onOpenScratchpad}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
              isScratchpadOpen
                ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/30'
                : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700'
            }`}
            title="Open canvas scratchpad"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scratchpad</span>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-xl text-xs font-semibold bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-all active:scale-95 shadow-sm hover:text-white"
            title={theme === 'dark' ? 'Switch to High-Contrast Light Mode (Daytime Study)' : 'Switch to Dark Blackboard Mode'}
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around px-2 py-2 border-t border-slate-800/80 bg-slate-950 overflow-x-auto text-[11px] font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('tutor')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'tutor' ? 'text-white bg-indigo-600/30 font-bold' : ''}`}
        >
          Tutor
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'dashboard' ? 'text-white bg-indigo-600/30 font-bold' : ''}`}
        >
          Mastery
        </button>
        <button
          onClick={() => setActiveTab('srs')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'srs' ? 'text-white bg-indigo-600/30 font-bold' : ''}`}
        >
          SRS {srsDueCount > 0 && `(${srsDueCount})`}
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'chat' ? 'text-white bg-indigo-600/30 font-bold' : ''}`}
        >
          Bot
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`px-2.5 py-1 rounded-lg ${activeTab === 'seo' ? 'text-white bg-indigo-600/30 font-bold' : ''}`}
        >
          SEO
        </button>
        <button
          onClick={toggleTheme}
          className="p-1 rounded-lg text-slate-300 hover:text-white"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
