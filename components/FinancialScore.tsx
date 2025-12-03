
import React, { useMemo, useState, useEffect } from 'react';
import { Transaction, TransactionType, ScoreAnalysis } from '../types';
import { Gauge, TrendingUp, TrendingDown, Minus, Info, Zap } from 'lucide-react';
import { getScoreAdvice } from '../services/geminiService';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  transactions: Transaction[];
}

export const FinancialScore: React.FC<Props> = ({ transactions }) => {
  const [analysis, setAnalysis] = useState<ScoreAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [prevScore, setPrevScore] = useState<number>(0);

  // Calculate Score Algorithm
  const { score, details } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let savings = 0;
    let wants = 0;

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) income += t.amount;
      if (t.type === TransactionType.EXPENSE) {
        expenses += t.amount;
        if (!['Vivienda', 'Transporte', 'Servicios', 'Deudas', 'Educación', 'Salud'].includes(t.category)) {
          wants += t.amount;
        }
      }
      if (t.type === TransactionType.SAVING) savings += t.amount;
    });

    if (income === 0) return { score: 0, details: {} };

    // 1. Savings Ratio (Max 35 pts) - Ideal is 20%
    const savingsRatio = (savings + (income - expenses - savings)) / income;
    const savingsScore = Math.min((savingsRatio / 0.20) * 35, 35);

    // 2. Budget Stability (Max 25 pts) - Expenses should be < 90% of income
    const expenseRatio = expenses / income;
    const stabilityScore = expenseRatio < 0.9 ? 25 : Math.max(0, 25 - ((expenseRatio - 0.9) * 100));

    // 3. Discretionary Control (Max 25 pts) - Wants < 30%
    const wantsRatio = wants / income;
    const controlScore = wantsRatio < 0.3 ? 25 : Math.max(0, 25 - ((wantsRatio - 0.3) * 100));

    // 4. Solvency (Max 15 pts) - Positive Balance
    const balance = income - expenses - savings;
    const solvencyScore = balance > 0 ? 15 : 0;

    const totalScore = Math.round(savingsScore + stabilityScore + controlScore + solvencyScore);

    return { 
      score: totalScore,
      details: { savingsScore, stabilityScore, controlScore, solvencyScore }
    };
  }, [transactions]);

  // Load previous score from local storage to simulate "Weekly Evolution"
  useEffect(() => {
    const savedPrev = localStorage.getItem('budgetMate_prevScore');
    if (savedPrev) {
      setPrevScore(parseInt(savedPrev));
    } else {
      // First run simulation: assume a slightly lower score to show progress
      const simulatedPrev = Math.max(0, score - Math.floor(Math.random() * 5));
      setPrevScore(simulatedPrev);
      localStorage.setItem('budgetMate_prevScore', simulatedPrev.toString());
    }
  }, []); // Run once on mount

  // Update current score in storage BUT don't overwrite "prev" immediately 
  // In a real app, "prev" would be last week's snapshot.
  useEffect(() => {
    if (score > 0) {
        // We trigger AI analysis if score changes significantly or if first load
        if (!analysis && !loading) {
            fetchAdvice();
        }
    }
  }, [score]);

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await getScoreAdvice(score, prevScore, transactions);
    setAnalysis(result);
    setLoading(false);
  };

  const scoreColor = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const scoreLabel = score >= 80 ? 'Excelente' : score >= 60 ? 'Bueno' : 'Mejorable';
  const diff = score - prevScore;

  // Gauge Data
  const gaugeData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];

  if (transactions.length === 0) return null;

  return (
    <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl border border-gray-800 relative overflow-hidden mb-8">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
        
        {/* Left: Score Gauge */}
        <div className="flex flex-col items-center justify-center min-w-[200px]">
          <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Gauge size={16} /> BudgetMate Score™
          </h3>
          
          <div className="relative w-40 h-40">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gaugeData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={scoreColor} />
                  <Cell fill="#374151" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-8">
              <span className="text-4xl font-bold">{score}</span>
              <span className="text-sm font-medium" style={{ color: scoreColor }}>{scoreLabel}</span>
            </div>
          </div>
        </div>

        {/* Middle: Evolution & Reason */}
        <div className="flex-1 space-y-4 text-center md:text-left">
           <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 flex items-center gap-2">
                <span className="text-gray-400 text-xs">Semana Pasada: {prevScore}</span>
                <div className={`flex items-center text-sm font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                  {diff > 0 ? <TrendingUp size={16} /> : diff < 0 ? <TrendingDown size={16} /> : <Minus size={16} />}
                  <span className="ml-1">{Math.abs(diff)} pts</span>
                </div>
              </div>
           </div>

           <div>
             <h4 className="text-lg font-semibold mb-1">
               {analysis ? 'Análisis de Movimiento' : 'Analizando score...'}
             </h4>
             <p className="text-gray-400 text-sm leading-relaxed max-w-lg">
               {analysis ? analysis.reason : "Calculando por qué cambió tu puntaje basado en tus últimos movimientos..."}
             </p>
           </div>
        </div>

        {/* Right: AI Tips */}
        <div className="flex-1 bg-gray-800/50 rounded-xl p-4 border border-gray-700 w-full">
           <div className="flex items-center gap-2 mb-3 text-yellow-400">
             <Zap size={18} fill="currentColor" />
             <span className="font-bold text-sm">Tips para subir nivel</span>
           </div>
           
           {loading ? (
             <div className="space-y-2 animate-pulse">
               <div className="h-2 bg-gray-700 rounded w-3/4"></div>
               <div className="h-2 bg-gray-700 rounded w-1/2"></div>
             </div>
           ) : analysis ? (
             <ul className="space-y-2">
               {analysis.tips.map((tip, idx) => (
                 <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                   <span className="text-indigo-400 mt-1">•</span>
                   {tip}
                 </li>
               ))}
             </ul>
           ) : (
             <p className="text-xs text-gray-500">Generando estrategias personalizadas...</p>
           )}
        </div>

      </div>
    </div>
  );
};
