
import React, { useMemo, useState, useEffect } from 'react';
import { UserSettings, PaymentFrequency } from '../types';
import { CalendarClock, Coins, TrendingUp, Info } from 'lucide-react';

interface Props {
  settings: UserSettings;
  totalIncome: number;
}

export const ColombianContextWidget: React.FC<Props> = ({ settings, totalIncome }) => {
  const [daysToPayday, setDaysToPayday] = useState<number>(0);
  
  // Constants 2024/2025
  const SMLV = 1300000;
  
  const incomeInSmlv = (totalIncome / SMLV).toFixed(1);

  useEffect(() => {
    // Simple logic to calculate days until 15th or 30th (Quincena) or 30th (Mensual)
    const calculateCountdown = () => {
      const today = new Date();
      const day = today.getDate();
      let targetDate = new Date();

      if (settings.paymentFrequency === PaymentFrequency.BIWEEKLY) {
        if (day < 15) {
          targetDate.setDate(15);
        } else {
          // End of month logic
          targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        }
      } else {
        // Monthly - assume end of month
         targetDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      }
      
      const diffTime = Math.abs(targetDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      setDaysToPayday(diffDays);
    };

    calculateCountdown();
  }, [settings.paymentFrequency]);

  if (!settings.isColombianMode) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-400 via-blue-500 to-red-500 p-[2px] rounded-2xl mb-8 shadow-md">
      <div className="bg-white rounded-[14px] p-5">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
          
          {/* Header */}
          <div className="flex items-center gap-3">
             <div className="bg-yellow-100 p-2 rounded-full border border-yellow-200">
               <span className="text-2xl">🇨🇴</span>
             </div>
             <div>
               <h3 className="font-bold text-gray-800 text-lg">Modo Colombia</h3>
               <p className="text-xs text-gray-500">Análisis ajustado a tu realidad local</p>
             </div>
          </div>

          {/* Metrics Grid */}
          <div className="flex gap-4 md:gap-8 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            
            {/* Payday Countdown */}
            <div className="flex items-center gap-3 min-w-max">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <CalendarClock size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Próximo Pago</p>
                <p className="font-bold text-gray-800">
                  {daysToPayday === 0 ? '¡Es Hoy!' : `Faltan ${daysToPayday} días`}
                </p>
                <p className="text-[10px] text-blue-500 font-medium">{settings.paymentFrequency}</p>
              </div>
            </div>

            <div className="w-px bg-gray-200 h-8 hidden md:block"></div>

            {/* SMLV Indicator */}
            <div className="flex items-center gap-3 min-w-max">
               <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600">
                <Coins size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase">Poder Adquisitivo</p>
                <p className="font-bold text-gray-800">{incomeInSmlv} SMLV</p>
                <p className="text-[10px] text-yellow-600 font-medium">Ref: $1.3M COP</p>
              </div>
            </div>

             <div className="w-px bg-gray-200 h-8 hidden md:block"></div>

             {/* Inflation/Tip */}
             <div className="flex items-center gap-3 min-w-max">
               <div className="p-2 bg-red-50 rounded-lg text-red-600">
                <TrendingUp size={20} />
              </div>
              <div className="max-w-[150px]">
                <p className="text-xs text-gray-500 font-semibold uppercase">IPC Actual</p>
                 <p className="font-bold text-gray-800 text-sm">Alta Inflación</p>
                 <p className="text-[10px] text-gray-400">Cuida los gastos hormiga</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};