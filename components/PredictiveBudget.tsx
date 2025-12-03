import React, { useState } from 'react';
import { Sparkles, TrendingUp, Scissors, ArrowRight, Activity, CalendarDays } from 'lucide-react';
import { getBudgetPrediction } from '../services/geminiService';
import { Transaction, PredictionResult, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
  totalExpenses: number;
}

export const PredictiveBudget: React.FC<Props> = ({ transactions, totalExpenses }) => {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    // filter only expenses for the prediction context
    const expenseTrans = transactions.filter(t => t.type === TransactionType.EXPENSE);
    if (expenseTrans.length === 0) {
        setLoading(false);
        return;
    }
    
    const result = await getBudgetPrediction(transactions, totalExpenses);
    setPrediction(result);
    setLoading(false);
  };

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-700">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500 rounded-full blur-3xl opacity-20"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
               <Sparkles className="text-purple-300" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-indigo-200">
                Presupuesto Predictivo
              </h3>
              <p className="text-slate-400 text-xs">IA Forecaster Engine</p>
            </div>
          </div>

          {!prediction && (
            <button
              onClick={handlePredict}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Activity className="animate-spin" size={16} /> Calculando...
                </>
              ) : (
                <>
                  <CalendarDays size={16} /> Predecir Mes Siguiente
                </>
              )}
            </button>
          )}
        </div>

        {!prediction && !loading && (
          <div className="text-center py-6 text-slate-400 text-sm border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/50">
            ¿Quieres saber cuánto gastarás el próximo mes? <br/>
            Nuestra IA analiza tendencias y proyecta tu futuro financiero.
          </div>
        )}

        {prediction && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
            {/* Total Prediction Card */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-purple-500/50 transition-colors">
              <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">Proyección Total</h4>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{formatMoney(prediction.predictedTotal)}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${prediction.percentageChange > 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                  {prediction.percentageChange > 0 ? '+' : ''}{prediction.percentageChange}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                vs. {formatMoney(totalExpenses)} este mes
              </p>
            </div>

            {/* Rising Category */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-red-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Riesgo de Alza</h4>
                <TrendingUp size={16} className="text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <p className="text-lg font-bold text-red-200">{prediction.riskyCategory}</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">
                {prediction.riskReason}
              </p>
            </div>

            {/* Cut Suggestion */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 hover:border-emerald-500/50 transition-colors group">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-slate-400 text-xs font-medium uppercase tracking-wider">Recorte Sugerido</h4>
                <Scissors size={16} className="text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
              <p className="text-lg font-bold text-emerald-200">{prediction.cutCategory}</p>
               <p className="text-xs text-slate-400 mt-1 leading-snug">
                {prediction.cutSuggestion}
              </p>
            </div>
          </div>
        )}
        
        {prediction && (
           <div className="mt-4 flex justify-center">
             <button 
               onClick={handlePredict} 
               className="text-xs text-slate-500 hover:text-purple-300 flex items-center gap-1 transition-colors"
             >
               Recalcular Proyección <ArrowRight size={12}/>
             </button>
           </div>
        )}
      </div>
    </div>
  );
};