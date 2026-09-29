import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Loader2, 
  AlertCircle, 
  BookOpen, 
  Zap,
  Check
} from 'lucide-react';
import { Question, TopicName } from '../types/math';

interface AiProblemSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuestionGenerated: (question: Question) => void;
}

const SAMPLE_PROMPTS = [
  {
    topic: 'Calculus',
    prompt: 'Find the derivative of f(x) = ln(x^2 + 1) / (x + 3) using quotient and chain rules.',
  },
  {
    topic: 'Algebra',
    prompt: 'Solve the system of equations using Cramer\'s rule: 2x - y = 7 and 3x + 2y = 7.',
  },
  {
    topic: 'Trigonometry',
    prompt: 'Express 5 sin(x) + 12 cos(x) in the form R sin(x + alpha), where R > 0 and alpha is acute.',
  },
  {
    topic: 'Vectors & Mechanics',
    prompt: 'Find the unit vector perpendicular to both u = 3i - 2j + k and v = i + j - 2k using the vector cross product.',
  },
];

export const AiProblemSolverModal: React.FC<AiProblemSolverModalProps> = ({
  isOpen,
  onClose,
  onQuestionGenerated,
}) => {
  const [topic, setTopic] = useState<TopicName>('Calculus');
  const [problemPrompt, setProblemPrompt] = useState<string>('');
  const [difficulty, setDifficulty] = useState<1 | 2 | 3>(2);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemPrompt.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/gemini/solve-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemPrompt,
          topic,
          difficulty,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate step-by-step breakdown');
      }

      const generatedQuestion: Question = {
        id: 'ai_' + Date.now(),
        topic: (data.question.topic as TopicName) || topic,
        subtopic: data.question.subtopic || 'AI Step Breakdown',
        year: 'AI Generated • JUPEB Syllabus',
        question_text: data.question.question_text || problemPrompt,
        difficulty_level: data.question.difficulty_level || difficulty,
        key_concept: data.question.key_concept || 'Fundamental theorems',
        final_answer: data.question.final_answer || '',
        steps: data.question.steps || [],
        diagram_config: data.question.diagram_config,
      };

      onQuestionGenerated(generatedQuestion);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'Could not parse problem. Ensure your API key is active or try a simpler question.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-white text-base">
                AI Step-by-Step Question & Graph Compiler
              </h2>
              <p className="text-xs text-slate-400">
                Pipes raw JUPEB questions into progressive steps, Function Plot SVG diagrams, and Matplotlib Python scripts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Topic Area
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value as TopicName)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="Calculus">Calculus</option>
                <option value="Algebra">Algebra</option>
                <option value="Trigonometry">Trigonometry</option>
                <option value="Coordinate Geometry">Coordinate Geometry</option>
                <option value="Vectors & Mechanics">Vectors & Mechanics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Target Rigor / Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { level: 1, label: 'Level 1' },
                  { level: 2, label: 'Standard' },
                  { level: 3, label: 'Advanced' },
                ].map((d) => (
                  <button
                    type="button"
                    key={d.level}
                    onClick={() => setDifficulty(d.level as any)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      difficulty === d.level
                        ? 'bg-indigo-600/30 border-indigo-500 text-white font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Paste or Type JUPEB Math Problem
            </label>
            <textarea
              rows={4}
              value={problemPrompt}
              onChange={(e) => setProblemPrompt(e.target.value)}
              placeholder="e.g., Evaluate the definite integral of (3x^2 - 4x + 1) from x = 1 to x = 3..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          {/* Quick Examples */}
          <div>
            <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
              Or pick an exam question template:
            </div>
            <div className="space-y-1.5">
              {SAMPLE_PROMPTS.map((item, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setTopic(item.topic as TopicName);
                    setProblemPrompt(item.prompt);
                  }}
                  className="w-full text-left p-2 rounded-lg bg-slate-950/40 hover:bg-slate-800/60 border border-slate-800/80 text-[11px] text-slate-300 hover:text-white transition-colors truncate block"
                >
                  <span className="font-semibold text-indigo-400 mr-2">[{item.topic}]</span>
                  {item.prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !problemPrompt.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-all shadow-md active:scale-95"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Steps...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Step Breakdown</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AiProblemSolverModal;
