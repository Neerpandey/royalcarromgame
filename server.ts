import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route for Gemini Bot AI
  app.post("/api/bot-shot", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is missing." });
      }

      const { difficulty, boardState, options } = req.body;
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
      You are an expert Carrom Bot (${difficulty} difficulty). 
      The board has the following pieces remaining: ${boardState.whites} whites, ${boardState.blacks} blacks, queen is ${boardState.queenIsPocketed ? 'pocketed' : 'on board'}.
      My team is ${boardState.botTeam}.
      
      Here are the top ${options.length} shot options I have calculated based on physics:
      ${options.map((opt: any, i: number) => `Option ${i}: ${opt.reason} (Score: ${Math.round(opt.score)})`).join('\n')}
      
      Choose the best option for me to take. 
      Return ONLY a JSON object with:
      {
        "selectedIndex": <number between 0 and ${options.length - 1}>,
        "thought": "<short 1-sentence catchy strategic comment like 'I see a clean cut on the white.'>"
      }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.7
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);

      res.json(result);
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
