import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Server-side Gemini client initialization with standard telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to check if API key exists
const hasApiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');

// 1. Dynamic Socratic Hint Endpoint
app.post('/api/gemini/hint', async (req, res) => {
  try {
    const { questionText, stepOrder, totalSteps, instruction, mathEquation, topic, studentContext } = req.body;

    if (!hasApiKey) {
      // High-quality contextual fallback hints when API key is unconfigured
      const fallbacks: Record<string, string> = {
        'Calculus': 'Focus on standard rules: identify if this is a product $u \\cdot v$, quotient $\\frac{u}{v}$, or composite function needing the Chain Rule $\\frac{dy}{du} \\cdot \\frac{du}{dx}$.',
        'Algebra': 'Look for common factors, check discriminant $b^2 - 4ac$, or isolate the leading term before substituting.',
        'Trigonometry': 'Consider fundamental identities: $\\sin^2\\theta + \\cos^2\\theta = 1$, or double-angle expansions $\\cos 2\\theta = \\cos^2\\theta - \\sin^2\\theta$.',
        'Vectors & Mechanics': 'Break into orthogonal components $\\hat{i}, \\hat{j}, \\hat{k}$ or use the dot product formula $\\vec{a} \\cdot \\vec{b} = |a||b|\\cos\\theta$.',
      };
      const hintMsg = fallbacks[topic] || 'Break down the equation into simpler components and solve each part systematically before recombining.';
      return res.json({
        hint: `Hint for Step ${stepOrder}: ${hintMsg} Remember to check sign changes during algebraic simplification!`,
        source: 'local',
      });
    }

    const prompt = `You are an expert JUPEB / Cambridge A-Level Mathematics tutor.
A student is working on the following problem:
Topic: ${topic}
Problem: "${questionText}"

They are currently stuck on Step ${stepOrder} of ${totalSteps}.
Step Goal/Instruction: "${instruction}"
Step Math Equation (DO NOT REVEAL THIS DIRECTLY!): "${mathEquation}"
${studentContext ? `Student's specific doubt: "${studentContext}"` : ''}

Task:
Provide a concise Socratic hint (2-3 sentences max) that guides them to take the next mathematical step themselves.
- Remind them of the underlying theorem, formula, or algebraic identity to invoke.
- Point out what variables or coefficients to watch out for (e.g. negative signs, chain rule constant).
- Do NOT output the complete final answer for this step.
- Use standard LaTeX notation enclosed in single dollar signs (e.g. $f'(x) = 2x$) for math.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an encouraging, rigorous university-level Mathematics Professor tutoring JUPEB/A-Level students. Keep explanations clear, mathematically precise, and pedagogical.',
        temperature: 0.7,
      },
    });

    res.json({
      hint: response.text?.trim() || 'Review the algebraic identities and differentiate/integrate term by term.',
      source: 'gemini',
    });
  } catch (error: any) {
    console.error('Error generating AI hint:', error);
    res.status(500).json({
      error: 'Failed to generate hint',
      fallback: 'Recall fundamental formulas for this topic and isolate the primary variable step-by-step.',
    });
  }
});

// 2. Automated Step-by-Step Question Generator & Problem Solver
app.post('/api/gemini/solve-problem', async (req, res) => {
  try {
    const { problemPrompt, topic = 'Calculus', difficulty = 2 } = req.body;

    if (!problemPrompt || problemPrompt.trim() === '') {
      return res.status(400).json({ error: 'Problem prompt is required' });
    }

    if (!hasApiKey) {
      return res.status(503).json({
        error: 'Gemini API key is not configured in environment. Using pre-loaded JUPEB past questions.',
      });
    }

    const systemPrompt = `You are a curriculum designer and mathematical visualization engineer for JUPEB (Joint Universities Preliminary Examinations Board) Advanced Level Mathematics.
Convert the user's math problem into a structured, step-by-step interactive lesson with clear pedagogical milestones, and extract the complete dual-ecosystem visual specification:
1. JavaScript Ecosystem (Dynamic Client-Side):
   - Function Plot JSON configuration with valid math strings (e.g. "x^2 * sin(3 * x)", "exp(2 * x)", "-0.75 * x + 6.75")
   - Suitable xDomain and yDomain
   - Key coordinates, roots, or points of tangency
2. Python Ecosystem (Backend Batch & Social Media / Video Assets):
   - Standalone Matplotlib script styled with modern dark/light grid, labels, and latex annotations for batch generation to Cloudflare R2 / OpenGraph cards.
   - Manim (Mathematical Animation Engine, 3Blue1Brown style) Python script showing moving secant/tangent lines, area under the curve shading, or vector transformations suitable for YouTube/TikTok/Shorts educational distribution.`;

    const userPrompt = `Please solve, break down into 3 to 6 progressive steps, and generate the full dual-ecosystem diagram specification (Function Plot JSON + Matplotlib Script + 3Blue1Brown Manim Animation Script) for this JUPEB math question:
Topic: ${topic}
Difficulty Level: ${difficulty} (1 = Easy, 2 = Standard JUPEB exam, 3 = Rigorous / Multi-concept)
Problem: "${problemPrompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            subtopic: { type: Type.STRING },
            question_text: { type: Type.STRING, description: 'Question statement with LaTeX math' },
            difficulty_level: { type: Type.INTEGER },
            key_concept: { type: Type.STRING, description: 'Key theorem or formula formula string' },
            final_answer: { type: Type.STRING, description: 'LaTeX string of final simplified answer' },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step_order: { type: Type.INTEGER },
                  instruction: { type: Type.STRING },
                  math_equation: { type: Type.STRING, description: 'LaTeX representation of this step equation' },
                  hint: { type: Type.STRING, description: 'Guidance hint for this step' },
                  common_pitfall: { type: Type.STRING, description: 'Mistake to avoid' },
                },
                required: ['step_order', 'instruction', 'math_equation', 'hint', 'common_pitfall'],
              },
            },
            diagram_config: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: 'function-plot, geometry-plane, or vector-plane' },
                title: { type: Type.STRING },
                xDomain: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                yDomain: { type: Type.ARRAY, items: { type: Type.NUMBER } },
                curves: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      fn: { type: Type.STRING },
                      color: { type: Type.STRING },
                    },
                    required: ['fn'],
                  },
                },
                points: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      x: { type: Type.NUMBER },
                      y: { type: Type.NUMBER },
                      label: { type: Type.STRING },
                    },
                    required: ['x', 'y'],
                  },
                },
                matplotlibPythonScript: { type: Type.STRING, description: 'Complete runnable Python Matplotlib code' },
                manimAnimationScript: { type: Type.STRING, description: 'Complete runnable 3Blue1Brown Manim Community Python animation script (Scene class)' },
                explanation: { type: Type.STRING, description: 'Visual explanation of the diagram features' },
              },
              required: ['type', 'title', 'xDomain', 'yDomain', 'curves', 'matplotlibPythonScript'],
            },
          },
          required: ['topic', 'subtopic', 'question_text', 'key_concept', 'final_answer', 'steps'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, question: parsed });
  } catch (error: any) {
    console.error('Error generating step-by-step problem breakdown:', error);
    res.status(500).json({ error: error.message || 'Failed to solve problem' });
  }
});

// 3. WhatsApp / Telegram Conversational Tutor Endpoint
app.post('/api/gemini/chat-tutor', async (req, res) => {
  try {
    const { messages, currentQuestion } = req.body;

    if (!hasApiKey) {
      return res.json({
        reply: `Hello! I'm your JUPEB Math Study Bot. For question "${currentQuestion?.question_text || 'this problem'}", try identifying the relevant theorem first (e.g. Integration by Parts $\\int u v' = uv - \\int u' v$). What step are you trying to solve?`,
      });
    }

    const conversationPrompt = `You are "JUPEB Math Companion", an ultra-friendly, concise WhatsApp/Telegram conversational tutor for Nigerian and West African students preparing for JUPEB university foundation exams.
Current Question under study:
Topic: ${currentQuestion?.topic || 'General Math'}
Question: "${currentQuestion?.question_text || 'Current problem'}"
Key Concept: "${currentQuestion?.key_concept || 'Formulas'}"

Conversation History:
${(messages || []).map((m: any) => `${m.sender === 'user' ? 'Student' : 'Bot'}: ${m.text}`).join('\n')}

Guidelines:
- Reply in WhatsApp/Telegram chat style: snappy, encouraging, with brief emojis and clean bullet points.
- Use single dollar signs $ ... $ for inline math formulas so KaTeX can render them.
- If the student is asking for the answer, challenge them with a leading question first!
- Keep replies under 120 words unless they ask for a full derivation.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationPrompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      reply: response.text?.trim() || 'Great effort! Let us examine that equation again.',
    });
  } catch (error: any) {
    console.error('Error in chat tutor:', error);
    res.status(500).json({ error: 'Chat service unavailable', reply: 'I had a momentary glitch, but keep going! What does your working show?' });
  }
});

// Vite middleware or Static build serving
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, '0.0.0.0', () => {
  console.log(`JUPEB Math Mastery Server running on http://0.0.0.0:${port}`);
});
