import React, { useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { 
  HeartPulse, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  AlertCircle,
  ShieldCheck,
  Smile,
  Frown,
  Meh
} from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

export const FinancialHealth: React.FC<Props> = ({ transactions }) => {
  const stats = useMemo(() => {
    let income = 0;
    let needs = 0;
    let wants = 0;
    let savings = 0;
    const categoryTotals: Record<string, number> = {};

    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) {
        income += t.amount;
      } else if (t.type === TransactionType.SAVING) {
        savings += t.amount;
      } else if (t.type === TransactionType.EXPENSE) {
        // Track category totals for alerts
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;

        // Classify 50/30/20
        // Needs: Essential survival expenses
        if (['Vivienda', 'Comida', 'Transporte', 'Servicios', 'Salud', 'Educación', 'Deudas'].includes(t.category)) {
          needs += t.amount;
        } else {
          // Wants: Entertainment, Shopping, etc.
          wants += t.amount;
        }
      }
    });

    // Potential savings includes defined savings + unspent money (balance)
    const rawBalance = income - needs - wants - savings;
    const potentialSavings = savings + (rawBalance > 0 ? rawBalance : 0);
    const savingsRate = income > 0 ? (potentialSavings / income) * 100 : 0;

    return { 
      income, 
      needs, 
      wants, 
      savings: potentialSavings, // We count positive balance as potential savings
      savingsRate,
      categoryTotals,
      rawBalance
    };
  }, [transactions]);

  // "Financial Mood" Humanized Logic
  const mood = useMemo(() => {
    if (stats.rawBalance < 0) {
      return {
        emoji: '😰',
        title: 'Tus finanzas están estresadas',
        msg: 'Gastas más de lo que ganas. Tu bolsillo necesita un respiro urgente.',
        style: 'bg-red-50 border-red-200 text-red-800'
      };
    }
    
    if (stats.savingsRate >= 20) {
       return {
        emoji: '🤩',
        title: '¡Tu bolsillo se siente genial!',
        msg: 'Estás en modo experto. ¡Un mes extra saludable!',
        style: 'bg-emerald-50 border-emerald-200 text-emerald-800'
      };
    }

    if (stats.savingsRate >= 10) {
      const gapTo20 = (20 - stats.savingsRate).toFixed(1);
      return {
        emoji: '😌',
        title: 'Tu bolsillo está relajado hoy',
        msg: `Vas por buen camino. Estás a solo ${gapTo20}% de tener un mes "extra saludable".`,
        style: 'bg-blue-50 border-blue-200 text-blue-800'
      };
    }

    if (stats.savingsRate > 0) {
       const gapTo10 = (10 - stats.savingsRate).toFixed(1);
       return {
        emoji: '🤔',
        title: 'Tus finanzas están pensativas',
        msg: `Ahorras un poco, pero podrías estar mejor. Estás a ${gapTo10}% de un estado de relajación.`,
        style: 'bg-yellow-50 border-yellow-200 text-yellow-800'
      };
    }

    return {
      emoji: '😐',
      title: 'Tus finanzas están al límite',
      msg: 'Llegas a fin de mes, pero sin margen de error. ¡Cuidado!',
      style: 'bg-orange-50 border-orange-200 text-orange-800'
    };

  }, [stats]);


  if (stats.income === 0) return null;

  // 1. Financial Health Score Logic
  const getHealthStatus = (rate: number) => {
    if (rate >= 20) return { 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-100', 
      icon: ShieldCheck, 
      label: 'Saludable', 
      desc: '¡Excelente! Estás construyendo un futuro sólido.' 
    };
    if (rate >= 10) return { 
      color: 'text-yellow-600', 
      bg: 'bg-yellow-100', 
      icon: CheckCircle, 
      label: 'Regular', 
      desc: 'Vas bien, pero intenta ajustar gastos para ahorrar más.' 
    };
    return { 
      color: 'text-red-600', 
      bg: 'bg-red-100', 
      icon: AlertCircle, 
      label: 'Crítico', 
      desc: 'Tus gastos consumen casi todo tu ingreso. Prioriza el ahorro.' 
    };
  };

  const health = getHealthStatus(stats.savingsRate);
  const HealthIcon = health.icon;

  // 2. Alerts Logic
  const alerts = [];
  if (stats.categoryTotals['Vivienda'] > stats.income * 0.35) {
    alerts.push({ msg: 'Tu gasto en Vivienda supera el 35% recomendado.', type: 'warning' });
  }
  if (stats.categoryTotals['Deudas'] > stats.income * 0.30) {
    alerts.push({ msg: 'El pago de Deudas consume más del 30% de tus ingresos.', type: 'danger' });
  }
  if (stats.categoryTotals['Comida'] > stats.income * 0.20) {
    alerts.push({ msg: 'Gastos en Comida superan el 20%. Considera cocinar más en casa.', type: 'info' });
  }
  if (stats.wants > stats.income * 0.35) {
    alerts.push({ msg: 'Tus gastos en "Deseos" (Ocio/Otros) son altos (>35%).', type: 'warning' });
  }

  // Helper for formatting
  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="space-y-6 mb-8">
      
      {/* Humanized Mood Banner */}
      <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm transition-all ${mood.style}`}>
        <div className="text-4xl filter drop-shadow-sm">{mood.emoji}</div>
        <div>
          <h3 className="font-bold text-lg">{mood.title}</h3>
          <p className="text-sm opacity-90">{mood.msg}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Col 1: Health Score & Projections */}
        <div className="space-y-6">
          {/* Health Score */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <HeartPulse className="text-pink-500" />
              <h3 className="font-bold text-gray-800">Salud Financiera</h3>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-4 rounded-full ${health.bg} ${health.color}`}>
                <HealthIcon size={32} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${health.color}`}>{health.label}</div>
                <div className="text-sm text-gray-500">Tasa de ahorro: {stats.savingsRate.toFixed(1)}%</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
              {health.desc}
            </p>
          </div>

          {/* Future Projection */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl shadow-lg text-white">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-blue-200" />
              <h3 className="font-bold text-white">Proyección Futura</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-500/30 pb-2">
                <span className="text-indigo-100 text-sm">En 1 año tendrás</span>
                <span className="text-xl font-bold">{formatMoney(stats.savings * 12)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-indigo-100 text-sm">En 5 años tendrás</span>
                <span className="text-xl font-bold text-green-300">{formatMoney(stats.savings * 60)}</span>
              </div>
            </div>
            <p className="text-xs text-indigo-200 mt-4 text-center">
              *Basado en tu capacidad de ahorro mensual actual de {formatMoney(stats.savings)}
            </p>
          </div>
        </div>

        {/* Col 2: 50/30/20 Rule */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="text-purple-500" />
              <h3 className="font-bold text-gray-800">Regla 50 / 30 / 20</h3>
            </div>
            <span className="text-xs font-medium bg-purple-50 text-purple-600 px-2 py-1 rounded-full">
              Análisis Mensual
            </span>
          </div>

          <div className="space-y-6 flex-1 justify-center flex flex-col">
            {/* Needs */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Necesidades (Meta: 50%)</span>
                <span className="font-bold text-gray-900">{formatMoney(stats.needs)} <span className="text-gray-400 font-normal">/ {((stats.needs/stats.income)*100).toFixed(0)}%</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${stats.needs/stats.income > 0.6 ? 'bg-red-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.min((stats.needs/stats.income)*100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Vivienda, Comida, Servicios, Transporte...</p>
            </div>

            {/* Wants */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Deseos (Meta: 30%)</span>
                <span className="font-bold text-gray-900">{formatMoney(stats.wants)} <span className="text-gray-400 font-normal">/ {((stats.wants/stats.income)*100).toFixed(0)}%</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${stats.wants/stats.income > 0.35 ? 'bg-yellow-400' : 'bg-blue-400'}`} 
                  style={{ width: `${Math.min((stats.wants/stats.income)*100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Entretenimiento, Regalos, Otros...</p>
            </div>

            {/* Savings */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Ahorro + Disponible (Meta: 20%)</span>
                <span className="font-bold text-gray-900">{formatMoney(stats.savings)} <span className="text-gray-400 font-normal">/ {((stats.savings/stats.income)*100).toFixed(0)}%</span></span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-3 rounded-full transition-all duration-1000 ${stats.savings/stats.income < 0.1 ? 'bg-red-400' : 'bg-purple-500'}`} 
                  style={{ width: `${Math.min((stats.savings/stats.income)*100, 100)}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">Ahorros definidos y dinero disponible a fin de mes</p>
            </div>
          </div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} /> Alertas Detectadas
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {alerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className={`text-xs p-3 rounded-lg border-l-4 ${
                      alert.type === 'danger' ? 'bg-red-50 border-red-500 text-red-700' : 
                      alert.type === 'warning' ? 'bg-orange-50 border-orange-500 text-orange-800' : 
                      'bg-blue-50 border-blue-500 text-blue-700'
                    }`}
                  >
                    {alert.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};