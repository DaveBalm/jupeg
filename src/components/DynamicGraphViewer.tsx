import React, { useEffect, useRef, useState } from 'react';
import functionPlot from 'function-plot';
import { 
  LineChart, 
  Maximize2, 
  RotateCcw, 
  Code2, 
  Copy, 
  Check, 
  Info, 
  Layers,
  ZoomIn,
  ZoomOut,
  Film,
  Play,
  Sparkles,
  Share2
} from 'lucide-react';
import { DiagramConfig } from '../types/math';
import { useTheme } from '../context/ThemeContext';

interface DynamicGraphViewerProps {
  config?: DiagramConfig;
  className?: string;
  defaultExpanded?: boolean;
}

export const DynamicGraphViewer: React.FC<DynamicGraphViewerProps> = ({
  config,
  className = '',
  defaultExpanded = true,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeView, setActiveView] = useState<'graph' | 'python' | 'manim' | 'json'>('graph');
  const [copied, setCopied] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!config) return null;

  useEffect(() => {
    if (activeView !== 'graph' || !containerRef.current) return;

    const el = containerRef.current;
    // Clear any previous chart children before rendering
    el.innerHTML = '';

    const width = el.clientWidth || 480;
    const height = 320;

    const xDomain = config.xDomain || [-4, 4];
    const yDomain = config.yDomain || [-4, 4];

    // Build data array for functionPlot
    const data: any[] = [];

    // 1. Add Curves
    if (config.curves && config.curves.length > 0) {
      config.curves.forEach((curve, idx) => {
        data.push({
          fn: curve.fn,
          color: curve.color || (idx === 0 ? '#38bdf8' : idx === 1 ? '#a855f7' : '#f59e0b'),
          graphType: 'polyline',
          range: curve.range,
          closed: curve.closed,
        });
      });
    }

    // 2. Add Integral shaded area if present
    if (config.integralArea) {
      data.push({
        fn: config.integralArea.fn,
        range: [config.integralArea.from, config.integralArea.to],
        closed: true,
        color: 'rgba(99, 102, 241, 0.25)',
      });
    }

    // 3. Add Key Points
    if (config.points && config.points.length > 0) {
      data.push({
        points: config.points.map((p) => [p.x, p.y]),
        fnType: 'points',
        graphType: 'scatter',
        color: '#f43f5e',
      });
    }

    try {
      functionPlot({
        target: el,
        width,
        height,
        grid: true,
        xAxis: {
          domain: [xDomain[0] * zoomLevel, xDomain[1] * zoomLevel],
          label: 'x-axis',
        },
        yAxis: {
          domain: [yDomain[0] * zoomLevel, yDomain[1] * zoomLevel],
          label: 'y-axis',
        },
        data: data.length > 0 ? data : [{ fn: 'x^2', color: '#38bdf8' }],
        disableZoom: false,
      });

      // Style SVG elements for dark / light theme aesthetics
      const svg = el.querySelector('svg');
      if (svg) {
        svg.style.borderRadius = '0.75rem';
        svg.style.background = isLight ? '#ffffff' : '#060a12';
        svg.style.overflow = 'hidden';

        // Tweak grid line styling
        const gridLines = el.querySelectorAll('.grid .tick line');
        gridLines.forEach((line: any) => {
          line.setAttribute('stroke', isLight ? '#e2e8f0' : '#1e293b');
          line.setAttribute('stroke-dasharray', '2,2');
        });

        // Tweak axis lines
        const axes = el.querySelectorAll('.axis path, .axis line');
        axes.forEach((axis: any) => {
          axis.setAttribute('stroke', isLight ? '#94a3b8' : '#475569');
        });

        // Tweak text
        const texts = el.querySelectorAll('.axis text, .top-right-legend text');
        texts.forEach((txt: any) => {
          txt.setAttribute('fill', isLight ? '#334155' : '#94a3b8');
          txt.style.fontSize = '11px';
        });
      }
    } catch (err) {
      console.warn('Function Plot render error:', err);
      // Fallback display if equation contains complex syntax
      el.innerHTML = `
        <div class="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
          <p class="font-semibold text-slate-300">Interactive SVG Visualizer</p>
          <p class="mt-1 font-mono text-indigo-400">${config.curves?.[0]?.fn || 'Math Function'}</p>
          <span class="mt-3 text-[11px] text-slate-500">Inspect the Matplotlib Python Script tab for publication-ready code!</span>
        </div>
      `;
    }
  }, [config, activeView, zoomLevel, isLight]);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => {
      const next = prev + delta;
      return next >= 0.5 && next <= 3 ? Number(next.toFixed(1)) : prev;
    });
  };

  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-lg ${className}`}>
      {/* Top Header & Tab Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-800 bg-slate-900/60">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <LineChart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>{config.title || 'Dynamic Mathematical Diagram'}</span>
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">
                Vector SVG
              </span>
            </div>
            {config.explanation && (
              <p className="text-[11px] text-slate-400 max-w-md truncate">
                {config.explanation}
              </p>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveView('graph')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeView === 'graph'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Interactive Graph
          </button>
          <button
            onClick={() => setActiveView('python')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeView === 'python'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Matplotlib Script</span>
          </button>
          <button
            onClick={() => setActiveView('manim')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeView === 'manim'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-rose-400" />
            <span>3Blue1Brown Manim</span>
          </button>
          <button
            onClick={() => setActiveView('json')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
              activeView === 'json'
                ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Config JSON
          </button>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="relative p-3">
        {/* 1. Interactive Function Plot Graph View */}
        {activeView === 'graph' && (
          <div className="space-y-2">
            <div className="relative w-full rounded-xl overflow-hidden border border-slate-800/80 bg-[#060a12] flex items-center justify-center min-h-[320px]">
              <div ref={containerRef} className="w-full flex justify-center py-2" />

              {/* Float Controls for Zoom & Reset */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700/60 shadow">
                <button
                  onClick={() => handleZoom(-0.25)}
                  title="Zoom In"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleZoom(0.25)}
                  title="Zoom Out"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  title="Reset Scale"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Hover Legend Pill */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
                {config.curves?.map((c, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-slate-300 backdrop-blur"
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1.5"
                      style={{ backgroundColor: c.color || '#38bdf8' }}
                    />
                    y = {c.fn}
                  </span>
                ))}
                {config.points?.map((p, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-950/80 border border-rose-500/30 text-rose-300 backdrop-blur"
                  >
                    ● {p.label || `(${p.x}, ${p.y})`}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>💡 Drag graph to pan • Scroll or use buttons to zoom</span>
              <span>Rendered with Function Plot + D3.js</span>
            </div>
          </div>
        )}

        {/* 2. Matplotlib Python Script View (Automated Pipeline Output) */}
        {activeView === 'python' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Automated Gemini pipeline output for backend rendering & PDF export:</span>
              <button
                onClick={() => handleCopyCode(config.matplotlibPythonScript || '')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Python!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[320px]">
              <code>{config.matplotlibPythonScript || '# No Matplotlib script available'}</code>
            </pre>
          </div>
        )}

        {/* 3. 3Blue1Brown Manim Animation Engine View */}
        {activeView === 'manim' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1 text-rose-300 font-medium">
                <Film className="w-3.5 h-3.5" />
                3Blue1Brown Manim Script (YouTube / TikTok / Short-form math video automation):
              </span>
              <button
                onClick={() => handleCopyCode(config.manimAnimationScript || '# Run manim -pql scene.py JUPEBAnimation')}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Manim!' : 'Copy Script'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 overflow-x-auto leading-relaxed max-h-[320px]">
              <code>
                {config.manimAnimationScript ||
`from manim import *

class JUPEBConceptAnimation(Scene):
    def construct(self):
        # Programmatic mathematical animation engine
        self.camera.background_color = "#060a12"
        axes = Axes(x_range=[-4, 4, 1], y_range=[-4, 4, 1])
        curve = axes.plot(lambda x: x**2, color=BLUE)
        self.play(Create(axes), Create(curve), run_time=2)
        self.wait(1)
`}
              </code>
            </pre>
          </div>
        )}

        {/* 4. JSON Configuration Object View (Database Storage Format) */}
        {activeView === 'json' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Stored PostgreSQL/Supabase JSON configuration:</span>
              <button
                onClick={() => handleCopyCode(JSON.stringify(config, null, 2))}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy JSON'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto leading-relaxed max-h-[320px]">
              <code>{JSON.stringify(config, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DynamicGraphViewer;
