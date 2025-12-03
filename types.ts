
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  SAVING = 'SAVING'
}

export enum Period {
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL'
}

export enum PaymentFrequency {
  MONTHLY = 'Mensual',
  BIWEEKLY = 'Quincenal', // Quincenal
  WEEKLY = 'Semanal'
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface UserSettings {
  currency: string;
  locale: string;
  isColombianMode: boolean;
  paymentFrequency: PaymentFrequency;
  nextPayday?: string; // ISO Date
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  balance: number;
}

export interface PredictionResult {
  predictedTotal: number;
  percentageChange: number;
  riskyCategory: string;
  riskReason: string;
  cutCategory: string;
  cutSuggestion: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  emoji: string;
  color: string;
  deadline?: string;
}

export interface GoalSuggestion {
  name: string;
  targetAmount: number;
  reason: string;
  emoji: string;
  estimatedMonths: number;
}

export interface ScoreAnalysis {
  reason: string;
  tips: string[];
}

export const CATEGORIES = {
  [TransactionType.INCOME]: ['Salario', 'Freelance', 'Inversiones', 'Regalos', 'Otros'],
  [TransactionType.EXPENSE]: ['Vivienda/Arriendo', 'Mercado', 'Transporte', 'Servicios', 'Ocio/Rumba', 'Salud', 'Educación', 'Deudas', 'Corrientazo', 'Otros'],
  [TransactionType.SAVING]: ['Fondo de Emergencia', 'Vacaciones', 'Jubilación', 'Coche/Moto', 'Vivienda Propia', 'Inversión']
};
