import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event) {
  try {
    const { transactions, totalExpenses, isColombianMode } = JSON.parse(event.body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Predicción de gastos...
      (usa tu prompt original exacto)
    `;

    const result = await model.generateContent(prompt);
    const json = JSON.parse(result.response.text());

    return { statusCode: 200, body: JSON.stringify(json) };

  } catch (e) {
    return { statusCode: 500, body: "Error en budgetPrediction" };
  }
}

