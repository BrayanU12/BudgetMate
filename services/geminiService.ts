
import { GoogleGenAI, SchemaType } from "@google/genai";
import { Transaction, TransactionType, Period, PredictionResult, GoalSuggestion, ScoreAnalysis, UserSettings } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Constants for Colombian Context
const SMLV_2024 = 1300000; // Approximate SMLV 2024
const AUX_TRANSPORTE = 162000;

export const getFinancialAdvice = async (
  transactions: Transaction[],
  period: Period,
  totalIncome: number,
  totalExpenses: number,
  settings?: UserSettings
): Promise<string> => {
  
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  const savings = transactions.filter(t => t.type === TransactionType.SAVING);
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0;
  
  // Build context based on mode
  let contextPrompt = "";
  if (settings?.isColombianMode) {
    const smlvCount = (totalIncome / SMLV_2024).toFixed(1);
    contextPrompt = `
      MODO COLOMBIA ACTIVADO 🇨🇴:
      - Moneda: Pesos Colombianos (COP).
      - Ingreso en SMLV: El usuario gana aprox ${smlvCount} Salarios Mínimos Legales Vigentes.
      - Contexto Económico: Ten en cuenta inflación local, costo de vida (arriendo, servicios estrato 1-6, transporte público/MIO/Transmilenio/Metro).
      - Jerga: Usa términos locales naturales (plata, lucas, corrientazo, quincena, rumba, "estar pelado") pero mantén el profesionalismo.
      - Prioridades: En Colombia, pagar arriendo y mercado es prioridad crítica.
    `;
  } else {
    contextPrompt = "Contexto: Finanzas personales generales (Global/USD).";
  }

  const prompt = `
    Actúa como "BudgetMate Coach", un experto en finanzas conductuales.
    ${contextPrompt}

    Contexto del Usuario (${period === Period.MONTHLY ? 'Vista Mensual' : 'Proyección Anual'}):
    - Ingresos Totales: ${totalIncome}
    - Gastos Totales: ${totalExpenses}
    - Tasa de Ahorro: ${(savingsRate * 100).toFixed(1)}%
    - Desglose: ${JSON.stringify(expensesByCategory)}

    Genera un análisis en Markdown:
    ### 🧠 Análisis de Comportamiento
    Explica qué dicen estos gastos sobre las prioridades.
    ${settings?.isColombianMode ? 'Si ves gastos altos en comida fuera, menciónalo en términos de "corrientazos" o "delivery".' : ''}

    ### 🔍 Patrones Detectados
    Identifica 2 tendencias. 
    ${settings?.isColombianMode ? 'Ej: "Tu arriendo consume el 40% de tu sueldo, en Colombia lo sano es máx 30%".' : ''}

    ### 💡 El Reto del Coach
    3 acciones específicas para esta semana.
    ${settings?.isColombianMode ? 'Si aplica, sugiere cocinar más y bajarle a los domicilios.' : ''}

    Tono: Empático, motivador, directo. Usa emojis.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { thinkingConfig: { thinkingBudget: 0 } }
    });
    return response.text || "No pude generar un análisis en este momento.";
  } catch (error) {
    console.error("Error fetching Gemini advice:", error);
    return "Tu Coach Financiero está tomando un tinto ☕. Intenta de nuevo en un momento.";
  }
};

export const getBudgetPrediction = async (
  transactions: Transaction[],
  totalExpenses: number,
  isColombianMode: boolean = false
): Promise<PredictionResult | null> => {
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  const expensesByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const prompt = `
    Predicción de Gastos.
    Contexto: ${isColombianMode ? 'Colombia (COP). Considera inflación local (IPC) y estacionalidad local (Prima en Junio/Dic, gastos escolares en Enero/Febrero).' : 'General (USD)'}.
    Gastos actuales: ${JSON.stringify(expensesByCategory)}
    Total: ${totalExpenses}

    Retorna JSON (predictedTotal, percentageChange, riskyCategory, riskReason, cutCategory, cutSuggestion).
    Para riskReason y cutSuggestion sé muy breve (max 10 palabras).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as PredictionResult;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const getGoalSuggestions = async (
  transactions: Transaction[],
  savingsRate: number,
  isColombianMode: boolean = false
): Promise<GoalSuggestion[]> => {
  const prompt = `
    Genera 3 objetivos de ahorro inteligentes (JSON).
    Contexto: ${isColombianMode ? 'Colombia. Sugiere metas locales como "Escapada a Santa Marta", "Entrada Apartamento VIS", "Moto Nueva", "Pagar Tarjeta de Crédito". Montos en Pesos Colombianos (millones).' : 'General'}.
    Tasa ahorro: ${(savingsRate * 100).toFixed(1)}%.
    
    Format: JSON Array [{name, targetAmount, reason, emoji, estimatedMonths}].
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as GoalSuggestion[];
    }
    return [];
  } catch (error) {
    return [];
  }
};

export const getScoreAdvice = async (
  score: number,
  prevScore: number,
  transactions: Transaction[],
  isColombianMode: boolean = false
): Promise<ScoreAnalysis | null> => {
  const prompt = `
    Analiza cambio de score financiero (0-100).
    Contexto: ${isColombianMode ? 'Colombia. Si el score es bajo, menciona el riesgo de "Gota a Gota" o sobreendeudamiento. Si es alto, sugiere invertir en CDTs o Finca Raíz.' : 'General'}.
    Score: ${score} (Prev: ${prevScore}).
    
    Retorna JSON {reason, tips[]}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    if (response.text) {
      return JSON.parse(response.text) as ScoreAnalysis;
    }
    return null;
  } catch (error) {
    return null;
  }
};