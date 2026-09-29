import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  ChevronRight, 
  Sparkles, 
  AlertTriangle, 
  HelpCircle, 
  RotateCcw, 
  PenTool, 
  Lightbulb, 
  Bookmark, 
  Check, 
  Clock, 
  Share2, 
  BookOpen, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { Question, Step, SRSItem } from '../types/math';
import MathView from './MathView';
import DynamicGraphViewer from './DynamicGraphViewer';
import { updateSRSProgress, saveAttempt, getStoredSRS } from '../utils/storage';

interface QuestionCardProps {
  question: Question;
  onNextQuestion?: () => void;
  onOpenScratchpad: () => void;
  onQuestionCompleted?: (rating: 'hard' | 'good' | 'easy') => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onNextQuestion,
  onOpenScratchpad,
  onQuestionCompleted,
}) => {
  // Revealed steps index tracker (0 means no steps revealed yet)
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [hints, setHints] = useState<Record<number, string>>({});
  const [loadingHintStep, setLoadingHintStep] = useState<number | null>(null);
  const [showKeyConcept, setShowKeyConcept] = useState<boolean>(true);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [completed, setCompleted] = useState<boolean>(false);
  const [srsState, setSrsState] = useState<SRSItem | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Reset state when question changes
  useEffect(() => {
    setRevealedCount(0);
    setHints({});
    setLoadingHintStep(null);
    setCompleted(false);
    setSelectedQuizOption(null);
    setShowQuizResult(false);
    setStartTime(Date.now());

    const allSRS = getStoredSRS();
    if (allSRS[question.id]) {
      setSrsState(allSRS[question.id]);
    } else {
      setSrsState(null);
    }
  }, [question.id]);

  const isAllRevealed = revealedCount >= question.steps.length;

  // Reveal next step handler
  const handleRevealNext = useCallback(() => {
    if (revealedCount < question.steps.length) {
      const nextCount = revealedCount + 1;
      setRevealedCount(nextCount);

      // If user just revealed the final step, celebrate and mark completed
      if (nextCount === question.steps.length && !completed) {
        setCompleted(true);
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#38bdf8', '#10b981', '#f59e0b'],
          });
        } catch {}
      }
    }
  }, [revealedCount, question.steps.length, completed]);

  // Reveal all steps at once
  const handleRevealAll = () => {
    setRevealedCount(question.steps.length);
    if (!completed) {
      setCompleted(true);
      try {
        confetti({
          particleCount: 50,
          spread: 50,
          origin: { y: 0.8 },
        });
      } catch {}
    }
  };

  const handleReset = () => {
    setRevealedCount(0);
    setCompleted(false);
    setSelectedQuizOption(null);
    setShowQuizResult(false);
    setStartTime(Date.now());
  };

  // Keyboard shortcut: Spacebar to advance step
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input/textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (!isAllRevealed) {
          handleRevealNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRevealNext, isAllRevealed]);

  // Fetch or generate dynamic AI hint for a specific step
  const handleRequestHint = async (step: Step) => {
    if (hints[step.step_order]) return; // Already fetched
    setLoadingHintStep(step.step_order);

    try {
      const res = await fetch('/api/gemini/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: question.question_text,
          stepOrder: step.step_order,
          totalSteps: question.steps.length,
          instruction: step.instruction,
          mathEquation: step.math_equation,
          topic: question.topic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setHints((prev) => ({
          ...prev,
          [step.step_order]: data.hint || step.hint,
        }));
      } else {
        setHints((prev) => ({
          ...prev,
          [step.step_order]: step.hint,
        }));
      }
    } catch {
      setHints((prev) => ({
        ...prev,
        [step.step_order]: step.hint,
      }));
    } finally {
      setLoadingHintStep(null);
    }
  };

  // Handle Spaced Repetition self rating
  const handleRating = (rating: 'hard' | 'good' | 'easy') => {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    const updated = updateSRSProgress(question.id, rating);
    setSrsState(updated);

    saveAttempt({
      id: 'att_' + Date.now(),
      question_id: question.id,
      topic: question.topic,
      is_correct: rating !== 'hard',
      time_taken_seconds: durationSeconds,
      attempted_at: new Date().toISOString(),
      hints_used_count: Object.keys(hints).length,
      steps_revealed_count: revealedCount,
      rating,
    });

    onQuestionCompleted?.(rating);
  };

  // Difficulty star coloring
  const renderDifficultyBadge = () => {
    const diff = question.difficulty_level;
    const labels = { 1: 'Foundation', 2: 'JUPEB Standard', 3: 'Challenging' };
    const colors = {
      1: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      2: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      3: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[diff]}`}>
        <span>●</span>
        {labels[diff]}
      </span>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5">
      {/* Main Question Card Container */}
      <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        {/* Card Header Info */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 font-semibold border border-indigo-500/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {question.topic}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
              {question.subtopic}
            </span>
            {question.year && (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                {question.year}
              </span>
            )}
            {renderDifficultyBadge()}
          </div>

          <div className="flex items-center gap-2">
            {srsState && (
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1 ${
                srsState.status === 'mastered'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <Clock className="w-3 h-3" />
                {srsState.status === 'mastered' ? 'Mastered' : `Interval: ${srsState.interval_days}d`}
              </span>
            )}
            <button
              onClick={onOpenScratchpad}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 transition-all shadow-sm"
              title="Open canvas scratchpad to write out your rough work"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span>Scratchpad</span>
            </button>
          </div>
        </div>

        {/* Question Statement */}
        <div className="p-6 md:p-8 space-y-4">
          <div className="space-y-2">
            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">
              Problem Statement
            </div>
            <div className="text-lg md:text-xl text-slate-100 font-medium leading-relaxed">
              <MathView text={question.question_text} />
            </div>
          </div>

          {/* Key Concept Formula Pill */}
          {question.key_concept && (
            <div className="pt-2">
              <button
                onClick={() => setShowKeyConcept(!showKeyConcept)}
                className="text-xs font-semibold text-slate-400 hover:text-indigo-300 flex items-center gap-1.5 transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>{showKeyConcept ? 'Hide' : 'View'} Core Theorem / Key Concept</span>
              </button>
              <AnimatePresence>
                {showKeyConcept && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs md:text-sm text-indigo-200"
                  >
                    <MathView text={question.key_concept} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Dynamic Mathematical Graph & Diagram Viewer */}
          {question.diagram_config && (
            <div className="pt-2">
              <DynamicGraphViewer config={question.diagram_config} />
            </div>
          )}

          {/* Quick Multiple Choice Option Test (Optional Practice Mode) */}
          {question.multiple_choice_options && (
            <div className="pt-3 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
                <span>Predict the final answer (JUPEB Exam Multiple Choice):</span>
                {showQuizResult && (
                  <span className="text-xs text-slate-400">
                    {question.multiple_choice_options.find((o) => o.label === selectedQuizOption)?.is_correct
                      ? '🎯 Correct prediction!'
                      : '💡 Follow the steps below to see why!'}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {question.multiple_choice_options.map((opt) => {
                  const isSelected = selectedQuizOption === opt.label;
                  let btnStyle = 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300';
                  if (showQuizResult) {
                    if (opt.is_correct) {
                      btnStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                    } else if (isSelected) {
                      btnStyle = 'bg-rose-950/40 border-rose-500/60 text-rose-300';
                    }
                  } else if (isSelected) {
                    btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white';
                  }

                  return (
                    <button
                      key={opt.label}
                      disabled={showQuizResult}
                      onClick={() => {
                        setSelectedQuizOption(opt.label);
                        setShowQuizResult(true);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left text-xs md:text-sm transition-all ${btnStyle}`}
                    >
                      <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold bg-slate-800/80 text-slate-300 text-xs">
                        {opt.label}
                      </span>
                      <span className="flex-1 truncate">
                        <MathView text={opt.text} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Step-by-Step Reveal Section */}
        <div className="border-t border-slate-800 bg-slate-950/40 p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Step-by-Step Derivation
              </span>
              <span className="text-xs font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                {revealedCount} of {question.steps.length} revealed
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="hidden sm:inline">Shortcut:</span>
              <kbd className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                Spacebar
              </kbd>
            </div>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-4">
            {question.steps.map((step, index) => {
              const isRevealed = index < revealedCount;
              const isCurrentTarget = index === revealedCount;
              const hasHint = Boolean(hints[step.step_order]);
              const isLoadingHint = loadingHintStep === step.step_order;

              return (
                <div
                  key={step.step_order}
                  className={`relative transition-all duration-300 rounded-2xl border ${
                    isRevealed
                      ? 'bg-slate-900/90 border-slate-700/80 shadow-md'
                      : isCurrentTarget
                      ? 'bg-slate-900/40 border-indigo-500/40 border-dashed'
                      : 'bg-slate-900/20 border-slate-800/40 opacity-40'
                  }`}
                >
                  {/* Step Header */}
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                            isRevealed
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : isCurrentTarget
                              ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                              : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isRevealed ? <Check className="w-4 h-4" /> : step.step_order}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                            Step {step.step_order} Milestone
                          </div>
                          <div className="text-sm sm:text-base font-medium text-slate-100 mt-0.5">
                            <MathView text={step.instruction} />
                          </div>
                        </div>
                      </div>

                      {/* Hint Button */}
                      {isRevealed && (
                        <button
                          onClick={() => handleRequestHint(step)}
                          disabled={isLoadingHint}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all shrink-0"
                          title="Get a pedagogical Socratic hint without spoiling the derivation"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isLoadingHint ? 'Thinking...' : hasHint ? 'Hint Active' : 'Get AI Hint'}</span>
                        </button>
                      )}
                    </div>

                    {/* Step Equation & Pitfalls (Animated Reveal) */}
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mt-4 pt-4 border-t border-slate-800/80 space-y-3"
                        >
                          {/* Math Equation Box */}
                          <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/20 text-center shadow-inner overflow-x-auto">
                            <MathView math={step.math_equation} block />
                          </div>

                          {/* Pedagogical Pitfall Banner */}
                          {step.common_pitfall && (
                            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-950/20 border border-rose-500/25 text-xs text-rose-300">
                              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="font-semibold text-rose-200">JUPEB Examiner Pitfall: </span>
                                <MathView text={step.common_pitfall} />
                              </div>
                            </div>
                          )}

                          {/* Dynamic AI Socratic Hint Display */}
                          {hasHint && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200"
                            >
                              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                              <div className="space-y-0.5">
                                <span className="font-semibold text-amber-300">Socratic Hint: </span>
                                <div>
                                  <MathView text={hints[step.step_order]} />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Unrevealed prompt banner */}
                    {!isRevealed && isCurrentTarget && (
                      <div className="mt-3 py-2 px-3 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-indigo-300 flex items-center justify-between">
                        <span>Attempt this step on your scratchpad or mentally before revealing!</span>
                        <button
                          onClick={handleRevealNext}
                          className="text-xs font-semibold underline underline-offset-2 hover:text-white"
                        >
                          Reveal Step {step.step_order}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Stepper Controls Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Steps</span>
              </button>

              {!isAllRevealed && (
                <button
                  onClick={handleRevealAll}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/50 transition-colors"
                >
                  Reveal All
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isAllRevealed ? (
                <button
                  onClick={handleRevealNext}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                  <span>Reveal Step {revealedCount + 1} of {question.steps.length}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All Steps Completed!</span>
                </div>
              )}
            </div>
          </div>

          {/* Final Answer Banner & Spaced Repetition Self-Assessment (When all steps revealed) */}
          {isAllRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-indigo-950/30 border border-emerald-500/30 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Final Simplified Result
                </span>
                <span className="text-xs text-slate-400">Awarded full JUPEB marks</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-center font-semibold text-lg text-emerald-200">
                <MathView math={question.final_answer} block />
              </div>

              {/* Spaced Repetition (SRS) Feedback Bar */}
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold">Rate your recall mastery for the Spaced Repetition Algorithm:</span>
                  <span className="text-slate-400">Calculates next review schedule</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleRating('hard')}
                    className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-rose-950/30 hover:bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all text-xs font-semibold"
                  >
                    <span>Struggled / Needed Hint</span>
                    <span className="text-[10px] text-rose-400/80 font-normal">Review in 1 day</span>
                  </button>
                  <button
                    onClick={() => handleRating('good')}
                    className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-indigo-950/30 hover:bg-indigo-950/50 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 transition-all text-xs font-semibold"
                  >
                    <span>Good / Moderate Recall</span>
                    <span className="text-[10px] text-indigo-400/80 font-normal">Review in 3 days</span>
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    className="flex flex-col items-center py-2.5 px-2 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200 transition-all text-xs font-semibold"
                  >
                    <span>Mastered / Effortless</span>
                    <span className="text-[10px] text-emerald-400/80 font-normal">Review in 7+ days</span>
                  </button>
                </div>
              </div>

              {/* Next Question CTA */}
              {onNextQuestion && (
                <div className="pt-3 flex justify-end">
                  <button
                    onClick={onNextQuestion}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-md active:scale-95"
                  >
                    <span>Next JUPEB Problem</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;
