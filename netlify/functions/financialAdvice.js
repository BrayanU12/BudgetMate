import { GoogleGenerativeAI } from "@google/generative-ai";

export async function handler(event) {
  try {
    const { transactions, period, totalIncome, totalExpenses, settings } = JSON.parse(event.body);

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Actúa como BudgetMate Coach...
      (puedes pegar aquí exactamente el mismo prompt que ya haces en el frontend)
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      statusCode: 200,
      body: JSON.stringify({ text })
    };
  } catch (error) {
    return { statusCode: 500, body: "Error en financialAdvice" };
  }
}

