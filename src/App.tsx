import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  PenTool, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  RotateCcw,
  Zap,
  Info,
  Clock,
  Layers
} from 'lucide-react';
import { INITIAL_JUPEB_QUESTIONS } from './data/jupebQuestions';
import { Question, TopicName, UserAttempt, UserProfile, SRSItem } from './types/math';
import { 
  getStoredAttempts, 
  getUserProfile, 
  getStoredSRS 
} from './utils/storage';
import Navbar, { ActiveTab } from './components/Navbar';
import QuestionCard from './components/QuestionCard';
import Scratchpad from './components/Scratchpad';
import TopicMasteryDashboard from './components/TopicMasteryDashboard';
import SpacedRepetitionQueue from './components/SpacedRepetitionQueue';
import ChatTutorSimulator from './components/ChatTutorSimulator';
import ProgrammaticSeoPreview from './components/ProgrammaticSeoPreview';
import AiProblemSolverModal from './components/AiProblemSolverModal';
import { useTheme } from './context/ThemeContext';

export default function App() {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const stored = localStorage.getItem('jupeb_custom_questions_v1');
      if (stored) {
        const custom = JSON.parse(stored);
        return [...custom, ...INITIAL_JUPEB_QUESTIONS];
      }
    } catch {}
    return INITIAL_JUPEB_QUESTIONS;
  });

  const [currentQuestionId, setCurrentQuestionId] = useState<string>(
    INITIAL_JUPEB_QUESTIONS[0]?.id || ''
  );
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<ActiveTab>('tutor');
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isAiSolverOpen, setIsAiSolverOpen] = useState<boolean>(false);

  const [userProfile, setUserProfile] = useState<UserProfile>(getUserProfile);
  const [attempts, setAttempts] = useState<UserAttempt[]>(getStoredAttempts);
  const [srsItems, setSrsItems] = useState<Record<string, SRSItem>>(getStoredSRS);

  // Sync stored data on reload
  const refreshUserData = () => {
    setUserProfile(getUserProfile());
    setAttempts(getStoredAttempts());
    setSrsItems(getStoredSRS());
  };

  // Filtered list of questions
  const filteredQuestions = useMemo(() => {
    if (selectedTopic === 'All') return questions;
    return questions.filter((q) => q.topic === selectedTopic);
  }, [questions, selectedTopic]);

  // Current active question
  const currentQuestion = useMemo(() => {
    return questions.find((q) => q.id === currentQuestionId) || filteredQuestions[0] || questions[0];
  }, [questions, currentQuestionId, filteredQuestions]);

  // Next Question in list
  const handleNextQuestion = () => {
    const currentIndex = filteredQuestions.findIndex((q) => q.id === currentQuestion.id);
    if (currentIndex !== -1 && currentIndex + 1 < filteredQuestions.length) {
      setCurrentQuestionId(filteredQuestions[currentIndex + 1].id);
    } else if (filteredQuestions.length > 0) {
      setCurrentQuestionId(filteredQuestions[0].id);
    }
  };

  const handlePrevQuestion = () => {
    const currentIndex = filteredQuestions.findIndex((q) => q.id === currentQuestion.id);
    if (currentIndex > 0) {
      setCurrentQuestionId(filteredQuestions[currentIndex - 1].id);
    }
  };

  // Add custom AI generated question
  const handleQuestionGenerated = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
    setCurrentQuestionId(newQuestion.id);
    setActiveTab('tutor');
    try {
      const stored = localStorage.getItem('jupeb_custom_questions_v1');
      const custom = stored ? JSON.parse(stored) : [];
      localStorage.setItem('jupeb_custom_questions_v1', JSON.stringify([newQuestion, ...custom]));
    } catch {}
  };

  // Count of items due for SRS review
  const srsDueCount = useMemo(() => {
    const now = new Date();
    return Object.values(srsItems).filter((item) => new Date(item.next_review_date) <= now).length;
  }, [srsItems]);

  const topicsList = ['All', 'Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry', 'Vectors & Mechanics'];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${
      isLight ? 'bg-slate-50 text-slate-900 selection:bg-indigo-500/20' : 'bg-slate-950 text-slate-100 selection:bg-indigo-500/30'
    }`}>
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={userProfile}
        srsDueCount={srsDueCount}
        onOpenScratchpad={() => setIsScratchpadOpen(!isScratchpadOpen)}
        onOpenAiSolver={() => setIsAiSolverOpen(true)}
        isScratchpadOpen={isScratchpadOpen}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6">
        {/* View 1: Interactive Step-by-Step Tutor */}
        {activeTab === 'tutor' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Topic Filter Chips & Question Pagination Controls */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 p-3 sm:p-4 rounded-2xl border border-slate-800/80 backdrop-blur">
              {/* Topic Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 mr-1 shrink-0">
                  <Filter className="w-3.5 h-3.5" />
                  Filter:
                </span>
                {topicsList.map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSelectedTopic(t);
                      const matching = t === 'All' ? questions : questions.filter((q) => q.topic === t);
                      if (matching.length > 0 && !matching.find((q) => q.id === currentQuestionId)) {
                        setCurrentQuestionId(matching[0].id);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                      selectedTopic === t
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Question Browser Strip */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  onClick={handlePrevQuestion}
                  disabled={filteredQuestions.findIndex((q) => q.id === currentQuestion.id) <= 0}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Previous Question"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-xs overflow-x-auto no-scrollbar py-0.5">
                  {filteredQuestions.map((q, idx) => {
                    const isActive = q.id === currentQuestion.id;
                    const srs = srsItems[q.id];
                    const isMastered = srs?.status === 'mastered';

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionId(q.id)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all relative shrink-0 flex items-center justify-center ${
                          isActive
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/40 shadow-sm'
                            : isMastered
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
                            : 'bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                        title={`${q.topic}: ${q.subtopic}`}
                      >
                        {idx + 1}
                        {isMastered && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={handleNextQuestion}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Next Question"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Core Interactive Question Card */}
            {currentQuestion ? (
              <QuestionCard
                question={currentQuestion}
                onNextQuestion={handleNextQuestion}
                onOpenScratchpad={() => setIsScratchpadOpen(true)}
                onQuestionCompleted={() => {
                  refreshUserData();
                }}
              />
            ) : (
              <div className="p-12 text-center text-slate-400">
                No questions found for this topic.
              </div>
            )}
          </div>
        )}

        {/* View 2: Topic Mastery Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <TopicMasteryDashboard
              attempts={attempts}
              userProfile={userProfile}
              onSelectTopic={(topic: TopicName) => {
                setSelectedTopic(topic);
                const matching = questions.filter((q) => q.topic === topic);
                if (matching.length > 0) {
                  setCurrentQuestionId(matching[0].id);
                }
                setActiveTab('tutor');
              }}
            />
          </div>
        )}

        {/* View 3: Spaced Repetition Queue */}
        {activeTab === 'srs' && (
          <div className="animate-in fade-in duration-300">
            <SpacedRepetitionQueue
              questions={questions}
              srsItems={srsItems}
              onSelectQuestion={(q: Question) => {
                setCurrentQuestionId(q.id);
                setActiveTab('tutor');
              }}
            />
          </div>
        )}

        {/* View 4: Conversational Tutor (WhatsApp/Telegram bot preview) */}
        {activeTab === 'chat' && (
          <div className="animate-in fade-in duration-300">
            <ChatTutorSimulator currentQuestion={currentQuestion} />
          </div>
        )}

        {/* View 5: Programmatic SEO Landing Preview */}
        {activeTab === 'seo' && (
          <div className="animate-in fade-in duration-300">
            <ProgrammaticSeoPreview
              question={currentQuestion}
              onOpenFullTutor={() => setActiveTab('tutor')}
            />
          </div>
        )}
      </main>

      {/* Persistent Canvas Scratchpad */}
      <Scratchpad
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
        title={`Scratchpad • ${currentQuestion.subtopic}`}
      />

      {/* AI Problem Solver / Compiler Modal */}
      <AiProblemSolverModal
        isOpen={isAiSolverOpen}
        onClose={() => setIsAiSolverOpen(false)}
        onQuestionGenerated={handleQuestionGenerated}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            JUPEB Mathematics Interactive Learning Platform • A-Level Advanced Mathematics Curriculum
          </span>
          <div className="flex items-center gap-3 text-slate-400">
            <span>KaTeX High-Fidelity Equations</span>
            <span>•</span>
            <span>SM-2 Spaced Repetition</span>
            <span>•</span>
            <span>Canvas Scratchpad</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
