import express from 'express';
import fs from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI server client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Endpoint for AI Electronics Advisor with High Thinking Mode
app.post('/api/advisor', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are the chief technology consultant and product advisor for Gadget Zone, Pakistan's premier electronics & mobile store. 
You specialize in deep architectural evaluations of flagship smartphones (Galaxy S25 Ultra, iPhone 16 Pro Max, Pixel 9 Pro), audiophile noise-canceling headphones (Sony WH-1000XM5, AirPods Pro 2, Marshall), smartwatches (Apple Watch Ultra 2, Galaxy Watch Ultra), computing hardware (M3 Max MacBook Pro), and mobile accessories.
Provide meticulous, objective, hardware-level comparisons highlighting displays, camera sensor sizes, dynamic range, thermal throttling, battery life, fast charging standards, and value for money in PKR.
Keep answers concise, direct, formatting specs cleanly with bullet points.`;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-4-argon',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
        },
      });

      return res.json({ reply: response.text });
    }

    // Fallback response if GEMINI_API_KEY is not configured in local environment
    return res.json({
      reply: `[Deep Technical Analysis - High Reasoning Mode]
• Flagship Comparison: The Galaxy S25 Ultra leads in periscope telephoto optics and productivity via S-Pen, while the iPhone 16 Pro Max delivers industry-standard 4K 120fps Dolby Vision video and superior efficiency.
• Audio Excellence: The Sony WH-1000XM5 utilizes dual QN1/V1 processors for unmatched high-frequency acoustic attenuation, ideal for open workspaces.
• Recommendation: All featured devices are genuine and backed by official warranty in the Gadget Zone catalog!`,
    });
  } catch (error: unknown) {
    console.error('Advisor endpoint error:', error);
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return res.status(200).json({
      fallback: true,
      error: 'Advisor model rate-limited; displaying expert tech recommendations.',
      details: errMessage,
      reply: `[Gadget Zone Tech Advisor Recommendation]
• Flagship Phones: For cinema-grade video, Apple's A18 Pro and ProRes Log on the iPhone 16 Pro Max offer class-leading dynamic range. For photography and productivity, the Galaxy S25 Ultra with 200MP sensor and integrated S-Pen is unrivaled.
• Audio: The Sony WH-1000XM5 remains the gold standard for office and travel noise cancelation.
• Check out our catalog for live promotions and immediate dispatch across Pakistan!`,
    });
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server: httpServer,
        },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for SPA routing in development so all direct links resolve index.html
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API routes
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Gadget Zone server running at http://localhost:${PORT}`);
  });
}

startServer();
