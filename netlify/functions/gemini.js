import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "dotenv";
import { NetlifyResponse } from "@netlify/functions";

config(); // para leer variables de entorno

export default async (req, context) => {
  try {
    const { action, payload } = JSON.parse(req.body);

    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    let result;

    switch (action) {
      case "financialAdvice":
        result = await model.generateContent(
          payload.prompt || "Dame un consejo financiero."
        );
        return {
          statusCode: 200,
          body: JSON.stringify({ text: result.response.text() })
        };

      case "prediction":
        result = await model.generateContent(payload.prompt);
        return {
          statusCode: 200,
          body: JSON.stringify(JSON.parse(result.response.text()))
        };

      case "goalSuggestions":
        result = await model.generateContent(payload.prompt);
        return {
          statusCode: 200,
          body: JSON.stringify(JSON.parse(result.response.text()))
        };

      case "scoreAdvice":
        result = await model.generateContent(payload.prompt);
        return {
          statusCode: 200,
          body: JSON.stringify(JSON.parse(result.response.text()))
        };

      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Acción no válida" })
        };
    }
  } catch (err) {
    console.error("Function Error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error en el servidor AI" })
    };
  }
};

