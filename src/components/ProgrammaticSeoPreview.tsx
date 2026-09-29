import React, { useState } from 'react';
import { 
  Globe, 
  Lock, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Code2,
  Image as ImageIcon,
  Share2,
  Cloud
} from 'lucide-react';
import { Question } from '../types/math';
import MathView from './MathView';
import DynamicGraphViewer from './DynamicGraphViewer';

interface ProgrammaticSeoPreviewProps {
  question: Question;
  onOpenFullTutor: () => void;
}

export const ProgrammaticSeoPreview: React.FC<ProgrammaticSeoPreviewProps> = ({
  question,
  onOpenFullTutor,
}) => {
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [showOgCard, setShowOgCard] = useState(true);

  // Generate canonical programmatic URL slug
  const slug = `/jupeb/${question.topic.toLowerCase().replace(/\s+/g, '-')}/${question.subtopic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/${question.id}`;

  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `How to solve: ${question.question_text.slice(0, 60)}... - Step-by-Step JUPEB Math`,
    description: `Complete step-by-step solution for ${question.topic}: ${question.subtopic}. Detailed mathematical derivation with LaTeX equations.`,
    educationalLevel: 'Advanced Level (JUPEB / IJMB / Cambridge A-Level)',
    teaches: question.key_concept,
    educationalUse: 'Question and step-by-step solution guide',
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top SEO Simulator Chrome Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-slate-200">
              Programmatic SEO Engine & Organic Traffic Landing Page
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOgCard(!showOgCard)}
              className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>{showOgCard ? 'Hide OpenGraph Asset' : 'View Social OG Card'}</span>
            </button>
            <button
              onClick={() => setShowJsonLd(!showJsonLd)}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>{showJsonLd ? 'Hide Schema' : 'Inspect JSON-LD'}</span>
            </button>
          </div>
        </div>

        {/* Browser URL bar simulation */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300">
          <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="text-slate-500">https://jupebmath.edu</span>
          <span className="text-emerald-400">{slug}</span>
        </div>

        {/* Cloudflare R2 / Open Graph Social Media Card Simulation */}
        {showOgCard && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Cloud className="w-3.5 h-3.5" />
                Backend Python Pipeline: Pre-generated Cloudflare R2 Asset (1200 × 630 px)
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Key: {question.diagram_config?.openGraphImageSpec?.r2BucketKey || `og-cards/${question.id}.png`}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-950 p-5 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-2 max-w-md">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500 text-white">
                    JUPEB EXAM ARCHIVE
                  </span>
                  <span className="text-[11px] text-slate-300 font-medium">
                    {question.topic} • {question.subtopic}
                  </span>
                </div>
                <div className="text-sm font-bold text-white leading-snug">
                  {question.question_text}
                </div>
                <div className="text-xs text-indigo-300">
                  Full step-by-step mathematical derivation + interactive SVG plot
                </div>
              </div>

              <div className="shrink-0 px-4 py-3 rounded-xl bg-slate-950/90 border border-indigo-500/30 text-center shadow-lg">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Target Answer</span>
                <span className="text-xs font-mono font-bold text-emerald-300 block mt-1">
                  {question.final_answer.slice(0, 30)}
                </span>
                <span className="text-[9px] text-indigo-400 block mt-1">jupebmath.edu</span>
              </div>
            </div>
          </div>
        )}

        {showJsonLd && (
          <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-indigo-300 overflow-x-auto">
            {JSON.stringify(jsonLdSchema, null, 2)}
          </pre>
        )}
      </div>

      {/* Simulated Landing Page Content */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              {question.topic}
            </span>
            <span className="text-slate-400">• {question.subtopic} • Step-by-Step Verified Solution</span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
            How to Solve: <MathView text={question.question_text} />
          </h1>
          <p className="text-xs text-slate-400">
            Published for JUPEB / Cambridge A-Level candidates. Verified step methodology.
          </p>
        </div>

        {/* Dynamic Vector SVG Diagram (Automated Client-Side Render) */}
        {question.diagram_config && (
          <div className="space-y-1.5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>Interactive Diagram & Geometric Plot</span>
            </div>
            <DynamicGraphViewer config={question.diagram_config} />
          </div>
        )}

        {/* Step 1 - Free Preview */}
        <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center border border-emerald-500/30">
                1
              </span>
              <span className="text-sm font-semibold text-white">
                Step 1: <MathView text={question.steps[0]?.instruction || 'Initial step'} />
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Free Preview Step
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-sm text-slate-100">
            <MathView math={question.steps[0]?.math_equation || ''} block />
          </div>

          <p className="text-xs text-slate-400">
            <strong>Key takeaway:</strong> {question.steps[0]?.hint}
          </p>
        </div>

        {/* Locked Steps & High-Converting Call to Action */}
        <div className="relative rounded-2xl border border-indigo-500/40 p-6 md:p-8 bg-gradient-to-b from-slate-950/80 via-indigo-950/40 to-slate-950 overflow-hidden text-center space-y-4">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg md:text-xl font-bold text-white">
              Unlock the Remaining {question.steps.length - 1} Steps & Interactive Tutor
            </h3>
            <p className="text-xs text-slate-300">
              Access the complete derivation, interactive rough scratchpad, examiner pitfall alerts, and Spaced Repetition mastery tracker.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenFullTutor}
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-500/25 transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Launch Full Interactive Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Free Demo Access
            </span>
            <span>•</span>
            <span>Full Syllabus Past Questions</span>
            <span>•</span>
            <span>Instant KaTeX Math</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgrammaticSeoPreview;
