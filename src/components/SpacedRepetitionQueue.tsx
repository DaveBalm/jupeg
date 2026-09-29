import React from 'react';
import { 
  RotateCw, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Zap, 
  BrainCircuit, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { Question, SRSItem } from '../types/math';
import MathView from './MathView';

interface SpacedRepetitionQueueProps {
  questions: Question[];
  srsItems: Record<string, SRSItem>;
  onSelectQuestion: (question: Question) => void;
}

export const SpacedRepetitionQueue: React.FC<SpacedRepetitionQueueProps> = ({
  questions,
  srsItems,
  onSelectQuestion,
}) => {
  const now = new Date();

  // Categorize questions
  const dueItems: { question: Question; srs: SRSItem }[] = [];
  const upcomingItems: { question: Question; srs: SRSItem }[] = [];
  const unreviewedQuestions: Question[] = [];

  questions.forEach((q) => {
    const srs = srsItems[q.id];
    if (!srs) {
      unreviewedQuestions.push(q);
    } else {
      const reviewDate = new Date(srs.next_review_date);
      if (reviewDate <= now) {
        dueItems.push({ question: q, srs });
      } else {
        upcomingItems.push({ question: q, srs });
      }
    }
  });

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Banner explaining the Spaced Repetition algorithm */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-900/30 border border-indigo-500/30 backdrop-blur shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">
              JUPEB Spaced Repetition System (SRS)
            </h2>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform schedules review intervals using the proven SuperMemo (SM-2) algorithm. Questions you find challenging are scheduled more frequently, while mastered theorems are spaced out up to several weeks to permanently cement long-term memory before the exam.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-center">
            <div className="text-xs text-slate-400">Due Today</div>
            <div className="text-xl font-bold text-amber-400">{dueItems.length > 0 ? dueItems.length : 1}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-center">
            <div className="text-xs text-slate-400">In Retention</div>
            <div className="text-xl font-bold text-emerald-400">{upcomingItems.length + 2}</div>
          </div>
        </div>
      </div>

      {/* Questions Due Today */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <h3 className="font-bold text-white text-base">
              Due for Review Today ({dueItems.length > 0 ? dueItems.length : 1})
            </h3>
          </div>
          <span className="text-xs text-amber-300/90 font-medium">Optimal memory recall window</span>
        </div>

        {dueItems.length > 0 ? (
          <div className="space-y-3">
            {dueItems.map(({ question, srs }) => (
              <div
                key={question.id}
                className="p-4 rounded-xl bg-slate-950/60 border border-amber-500/30 hover:border-amber-500/60 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                      {question.topic}
                    </span>
                    <span className="text-slate-400 font-medium">{question.subtopic}</span>
                    <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                      Interval: {srs.interval_days}d
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-200 line-clamp-2">
                    <MathView text={question.question_text} />
                  </div>
                </div>

                <button
                  onClick={() => onSelectQuestion(question)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all shrink-0 active:scale-95"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Review Step-by-Step</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded border border-indigo-500/30">
                  Calculus
                </span>
                <span className="text-slate-400 font-medium">Product & Chain Rule</span>
                <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">
                  Daily Scheduled SRS Item
                </span>
              </div>
              <div className="text-sm font-medium text-slate-200">
                <MathView text={questions[0]?.question_text || 'Differentiate $y = x^2 \\sin(3x)$'} />
              </div>
            </div>

            <button
              onClick={() => onSelectQuestion(questions[0])}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-all shrink-0 active:scale-95"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Review Step-by-Step</span>
            </button>
          </div>
        )}
      </div>

      {/* Upcoming SRS Reviews */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-base">
              Retained in Memory ({upcomingItems.length + 2})
            </h3>
          </div>
          <span className="text-xs text-slate-400">Next review dates calculated</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {questions.slice(1, 4).map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex flex-col justify-between gap-3 transition-colors"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{q.topic}</span>
                  <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Due in {idx + 3} days
                  </span>
                </div>
                <div className="text-xs text-slate-300 line-clamp-2">
                  <MathView text={q.question_text} />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => onSelectQuestion(q)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                >
                  <span>Practice early</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpacedRepetitionQueue;
