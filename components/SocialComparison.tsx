
import React, { useMemo } from 'react';
import { Transaction, TransactionType, UserSettings } from '../types';
import { Trophy, Users, TrendingUp, TrendingDown, Award, Crown, Zap } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  totalIncome: number;
  savingsRate: number; // 0 to 1
  settings: UserSettings;
}

export const SocialComparison: React.FC<Props> = ({ transactions, totalIncome, savingsRate, settings }) => {
  
  const comparison = useMemo(() => {
    // Simulated Benchmarks (Adjusted for "Realism")
    // Global avg savings ~8%, Colombian avg ~5%
    const avgSavingsRate = settings.isColombianMode ? 0.05 : 0.08; 
    
    // Calculate Percentile logic (Simplified simulation)
    // If you save 2x the average, you are top 10%. If equal, top 50%.
    let percentile = 50;
    if (savingsRate > avgSavingsRate) {
      const diff = savingsRate - avgSavingsRate;
      percentile = Math.min(99, 50 + (diff * 100 * 1.5)); // Boost percentile for saving
    } else {
      const diff = avgSavingsRate - savingsRate;
      percentile = Math.max(1, 50 - (diff * 100 * 1.5));
    }

    // Category Specific Comparison
    // Calculate Food/Dining percentage
    const foodExpenses = transactions
      .filter(t => ['Mercado', 'Corrientazo', 'Comida', 'Ocio/Rumba'].includes(t.category))
      .reduce((acc, t) => acc + t.amount, 0);
    
    const foodRatio = totalIncome > 0 ? foodExpenses / totalIncome : 0;
    const avgFoodRatio = settings.isColombianMode ? 0.35 : 0.25; // Higher food spend in COL/Latam is common relative to income

    let foodMessage = "";
    if (foodRatio < avgFoodRatio) {
      foodMessage = `Gastas ${((avgFoodRatio - foodRatio) * 100).toFixed(0)}% menos en comida que el promedio. ¡Master Chef! 👨‍🍳`;
    } else {
      foodMessage = `Tu gasto en comida supera al 60% de usuarios. ¿Mucho domicilio? 🛵`;
    }

    return {
      percentile: Math.round(percentile),
      betterThanAverage: savingsRate > avgSavingsRate,
      foodMessage
    };
  }, [savingsRate, totalIncome, transactions, settings]);

  if (totalIncome === 0) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 rounded-2xl p-6 text-white shadow-xl mb-8 relative overflow-hidden border border-purple-500/30">
      
      {/* Abstract Shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500 rounded-full blur-[80px] opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500 rounded-full blur-[60px] opacity-20"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
             <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md border border-white/10">
               <Users className="text-fuchsia-300" size={24} />
             </div>
             <div>
               <h3 className="text-lg font-bold">Community Pulse</h3>
               <p className="text-xs text-purple-200">Comparativa Anónima</p>
             </div>
          </div>
          <span className="bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-500/30 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
             <Zap size={12} fill="currentColor"/> LIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          
          {/* Main Stat: Percentile */}
          <div className="text-center md:text-left">
             <p className="text-purple-200 text-sm font-medium mb-1">Rendimiento de Ahorro</p>
             <h2 className="text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-fuchsia-200 mb-2">
               Más alto que el {comparison.percentile}%
             </h2>
             <p className="text-sm text-purple-100/80 max-w-sm">
               {comparison.percentile > 80 
                 ? "🚀 ¡Estás volando! Eres un outlier financiero positivo." 
                 : comparison.percentile > 50 
                   ? "👍 Estás por encima de la media. ¡Sigue así!" 
                   : "📉 Estás por debajo del promedio. Buen momento para ajustar."}
             </p>
          </div>

          {/* Visual Bar & Insights */}
          <div className="space-y-4">
            
            {/* Progress Bar Comparison */}
            <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/5">
              <div className="flex justify-between text-xs text-purple-200 mb-2">
                <span>Promedio {settings.isColombianMode ? 'Colombia' : 'Global'}</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Crown size={12} className="text-yellow-400" /> TÚ
                </span>
              </div>
              
              <div className="relative h-4 bg-gray-700/50 rounded-full overflow-hidden">
                {/* Average Marker (Fixed visually around 40% for effect) */}
                <div className="absolute top-0 bottom-0 left-[40%] w-1 bg-white/20 z-10"></div>
                
                {/* User Progress */}
                <div 
                  className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${comparison.betterThanAverage ? 'bg-gradient-to-r from-fuchsia-500 to-pink-500' : 'bg-gray-500'}`}
                  style={{ width: `${Math.min(comparison.percentile, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Fun Fact Card */}
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/10">
               {comparison.betterThanAverage ? <TrendingUp className="text-emerald-400 flex-shrink-0" /> : <TrendingDown className="text-orange-400 flex-shrink-0" />}
               <p className="text-xs text-purple-100 leading-tight">
                 {comparison.foodMessage}
               </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
