import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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
      "thought": "<short 1-sentence catchy strategic comment>"
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

    return res.status(200).json(result);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({ error: error.message });
  }
}
