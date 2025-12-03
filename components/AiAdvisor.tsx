
import React, { useState } from 'react';
import { Sparkles, RefreshCw, BrainCircuit, Lightbulb, MessageSquareQuote } from 'lucide-react';
import { getFinancialAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { Transaction, Period, UserSettings } from '../types';

interface Props {
  transactions: Transaction[];
  period: Period;
  totalIncome: number;
  totalExpenses: number;
  settings?: UserSettings; // Make optional to avoid breaking if not passed immediately, though recommended
}

export const AiAdvisor: React.FC<Props> = ({ transactions, period, totalIncome, totalExpenses, settings }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getFinancialAdvice(transactions, period, totalIncome, totalExpenses, settings);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl p-0 shadow-lg border border-indigo-100 overflow-hidden relative">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-start">
        <div className="flex gap-4">
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <BrainCircuit size={32} className="text-yellow-300" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Coach Financiero AI</h3>
            <p className="text-indigo-100 text-sm opacity-90">Análisis de comportamiento y hábitos</p>
          </div>
        </div>
        
        <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className="flex items-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
            {advice ? 'Nuevo Análisis' : 'Analizar mis Patrones'}
          </button>
      </div>

      <div className="p-6">
        {!advice && !loading && (
          <div className="text-center py-8 text-gray-500">
            <MessageSquareQuote size={48} className="mx-auto mb-4 text-indigo-100" />
            <p className="max-w-md mx-auto">
              "No solo calculo números. Haz clic en <b>Analizar mis Patrones</b> para que interprete tu comportamiento financiero, detecte fugas de dinero y te dé retos personalizados."
            </p>
          </div>
        )}

        {loading && (
          <div className="animate-pulse space-y-4 py-8">
            <div className="flex gap-3 items-center">
              <div className="h-4 bg-indigo-100 rounded w-1/4"></div>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-5/6"></div>
            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
            <div className="mt-8 flex gap-3 items-center">
              <div className="h-4 bg-indigo-100 rounded w-1/3"></div>
              <div className="h-px bg-gray-100 flex-1"></div>
            </div>
             <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-4/6"></div>
          </div>
        )}

        {advice && !loading && (
          <div className="prose prose-indigo max-w-none text-sm text-gray-600">
            <ReactMarkdown
               components={{
                h3: ({node, ...props}) => (
                  <div className="flex items-center gap-2 mt-6 mb-3 text-indigo-800 font-bold text-lg border-b border-indigo-50 pb-2">
                    <Lightbulb size={20} className="text-yellow-500" />
                    <span {...props} />
                  </div>
                ),
                strong: ({node, ...props}) => <span className="font-semibold text-gray-900 bg-yellow-50 px-1 rounded" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 my-4" {...props} />,
                li: ({node, ...props}) => (
                  <li className="flex gap-2 items-start" {...props}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0"></span>
                    <span className="flex-1">{props.children}</span>
                  </li>
                ),
                p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />
               }}
            >
              {advice}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};