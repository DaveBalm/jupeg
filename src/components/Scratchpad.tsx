import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Pen, 
  Eraser, 
  RotateCcw, 
  Trash2, 
  Download, 
  Grid, 
  Maximize2, 
  Minimize2, 
  X,
  Palette
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const Scratchpad: React.FC<ScratchpadProps> = ({
  isOpen,
  onClose,
  title = 'Student Rough Work & Derivation Scratchpad',
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<'pen' | 'eraser'>('pen');
  const [color, setColor] = useState<string>('#38bdf8');
  const [lineWidth, setLineWidth] = useState<number>(3);
  const [gridType, setGridType] = useState<'grid' | 'ruled' | 'dots' | 'blank'>('grid');
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update default pen color when theme changes
  useEffect(() => {
    if (isLight) {
      setColor('#2563eb'); // Blue ink in light mode
    } else {
      setColor('#38bdf8'); // Sky blue in dark mode
    }
  }, [isLight]);

  const colors = isLight
    ? [
        { label: 'Blue Ink', value: '#2563eb' },
        { label: 'Black Ink', value: '#0f172a' },
        { label: 'Emerald', value: '#059669' },
        { label: 'Amber', value: '#d97706' },
        { label: 'Red Pen', value: '#dc2626' },
        { label: 'Purple', value: '#7c3aed' },
      ]
    : [
        { label: 'Sky Blue', value: '#38bdf8' },
        { label: 'Chalk White', value: '#f8fafc' },
        { label: 'Emerald', value: '#34d399' },
        { label: 'Amber', value: '#fbbf24' },
        { label: 'Rose', value: '#f43f5e' },
        { label: 'Purple', value: '#c084fc' },
      ];

  // Resize canvas according to container
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save existing drawing before resizing
    const prevImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    // Set actual canvas resolution
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    // Scale context to device pixel ratio
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Restore previous drawing
    if (prevImage && prevImage.width > 0) {
      try {
        ctx.putImageData(prevImage, 0, 0);
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        resizeCanvas();
      }, 150);
      window.addEventListener('resize', resizeCanvas);
      return () => window.removeEventListener('resize', resizeCanvas);
    }
  }, [isOpen, isExpanded, resizeCanvas]);

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), data]);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveToHistory();

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (tool === 'eraser') {
      ctx.strokeStyle = isLight ? '#ffffff' : '#090d16'; // Erase to current paper color
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.closePath();
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || history.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previousState, 0, 0);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    saveToHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a composite canvas with background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    // Draw appropriate background
    exportCtx.fillStyle = isLight ? '#ffffff' : '#090d16';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    exportCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `JUPEB_Scratchpad_${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  if (!isOpen) return null;

  const canvasBgClass = isLight
    ? gridType === 'grid'
      ? 'bg-math-grid bg-white'
      : gridType === 'ruled'
      ? 'bg-ruled-paper bg-white'
      : 'bg-white'
    : gridType === 'grid'
    ? 'bg-math-grid bg-[#0a0f1d]'
    : gridType === 'ruled'
    ? 'bg-ruled-paper bg-[#0a0f1d]'
    : 'bg-[#0a0f1d]';

  return (
    <div
      className={`fixed z-50 transition-all duration-200 flex flex-col bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl overflow-hidden ${
        isExpanded
          ? 'inset-4 md:inset-8'
          : 'bottom-4 right-4 w-[92vw] sm:w-[540px] h-[580px] max-h-[85vh]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 select-none">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs sm:text-sm font-semibold text-slate-200 tracking-wide flex items-center gap-1.5">
            <Pen className="w-3.5 h-3.5 text-indigo-400" />
            {title}
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse' : 'Expand full-screen'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            title="Close scratchpad"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-slate-800/80 bg-slate-900/70 text-xs text-slate-300">
        {/* Tools: Pen & Eraser */}
        <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setTool('pen')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              tool === 'pen'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Pen className="w-3.5 h-3.5" />
            <span>Pen</span>
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
              tool === 'eraser'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Eraser</span>
          </button>
        </div>

        {/* Color Palette */}
        {tool === 'pen' && (
          <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {colors.map((c) => (
              <button
                key={c.value}
                onClick={() => setColor(c.value)}
                title={c.label}
                className={`w-5 h-5 rounded-full transition-transform ${
                  color === c.value ? 'scale-125 ring-2 ring-white ring-offset-1 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>
        )}

        {/* Stroke Width */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400">Size:</span>
          {[2, 4, 8].map((size) => (
            <button
              key={size}
              onClick={() => setLineWidth(size)}
              className={`w-6 h-6 flex items-center justify-center rounded transition-all ${
                lineWidth === size ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-500/50' : 'text-slate-400 hover:text-white'
              }`}
            >
              <div
                className="rounded-full bg-current"
                style={{ width: size * 1.5, height: size * 1.5 }}
              />
            </button>
          ))}
        </div>

        {/* Grid Paper Style & Actions */}
        <div className="flex items-center gap-1">
          <div className="flex items-center bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {(['grid', 'ruled', 'blank'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGridType(mode)}
                className={`px-2 py-1 rounded text-[11px] capitalize transition-colors ${
                  gridType === mode ? 'bg-slate-800 text-indigo-300 font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="Undo stroke"
            className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleClear}
            title="Clear all"
            className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownload}
            title="Save rough work as PNG"
            className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className={`flex-1 relative overflow-hidden cursor-crosshair touch-none ${canvasBgClass}`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 right-3 pointer-events-none text-[11px] text-slate-500/80 bg-slate-950/60 px-2.5 py-1 rounded-md backdrop-blur border border-slate-800/40">
          JUPEB Rough Sheet • Freehand Drawing
        </div>
      </div>
    </div>
  );
};

export default Scratchpad;
