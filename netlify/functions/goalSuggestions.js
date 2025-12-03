import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event) {
  try {
    const { savingsRate, isColombianMode } = JSON.parse(event.body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Genera 3 objetivos de ahorro...
      (usa tu prompt original)
    `;

    const result = await model.generateContent(prompt);

    return {
      statusCode: 200,
      body: result.response.text()
    };

  } catch (err) {
    return { statusCode: 500, body: "Error en goalSuggestions" };
  }
}

