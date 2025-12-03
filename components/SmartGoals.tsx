
import React, { useState } from 'react';
import { Target, Plus, Trophy, Sparkles, Rocket, TrendingUp, X } from 'lucide-react';
import { SavingsGoal, Transaction, GoalSuggestion } from '../types';
import { getGoalSuggestions } from '../services/geminiService';

interface Props {
  goals: SavingsGoal[];
  transactions: Transaction[];
  savingsRate: number; // 0 to 1
  onAddGoal: (goal: SavingsGoal) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
}

export const SmartGoals: React.FC<Props> = ({ goals, transactions, savingsRate, onAddGoal, onUpdateGoal, onDeleteGoal }) => {
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalEmoji, setNewGoalEmoji] = useState('🎯');

  const handleGetSuggestions = async () => {
    setLoadingSuggestions(true);
    const results = await getGoalSuggestions(transactions, savingsRate);
    setSuggestions(results);
    setLoadingSuggestions(false);
    setShowAddForm(true);
  };

  const handleAddGoal = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newGoalName || !newGoalAmount) return;

    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: newGoalName,
      targetAmount: parseFloat(newGoalAmount),
      currentAmount: 0,
      emoji: newGoalEmoji,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };

    onAddGoal(goal);
    resetForm();
  };

  const adoptSuggestion = (suggestion: GoalSuggestion) => {
    const goal: SavingsGoal = {
      id: crypto.randomUUID(),
      name: suggestion.name,
      targetAmount: suggestion.targetAmount,
      currentAmount: 0, // Starts at 0
      emoji: suggestion.emoji,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    };
    onAddGoal(goal);
    // Remove suggestion from list
    setSuggestions(prev => prev.filter(s => s.name !== suggestion.name));
  };

  const addFunds = (goal: SavingsGoal) => {
    // Simulate adding 10% or $50, whichever is relevant
    const increment = Math.ceil(goal.targetAmount * 0.1); 
    const updated = { ...goal, currentAmount: Math.min(goal.currentAmount + increment, goal.targetAmount) };
    onUpdateGoal(updated);
  };

  const resetForm = () => {
    setNewGoalName('');
    setNewGoalAmount('');
    setNewGoalEmoji('🎯');
    setShowAddForm(false);
  };

  const formatMoney = (amount: number) => 
    new Intl.NumberFormat('es-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-lg">
            <Trophy className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Objetivos Inteligentes</h3>
            <p className="text-gray-500 text-sm">Metas dinámicas adaptadas a ti</p>
          </div>
        </div>
        
        <div className="flex gap-2">
           <button 
            onClick={handleGetSuggestions}
            disabled={loadingSuggestions}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-70"
          >
            {loadingSuggestions ? <Sparkles className="animate-spin" size={16}/> : <Sparkles size={16}/>}
            {loadingSuggestions ? 'Pensando...' : 'Sugerir Metas IA'}
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus size={16} /> Crear
          </button>
        </div>
      </div>

      {/* Suggestions Area */}
      {suggestions.length > 0 && showAddForm && (
        <div className="mb-8 bg-violet-50 p-4 rounded-xl border border-violet-100 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-violet-800 flex items-center gap-2">
              <Sparkles size={16} /> Sugerencias para ti
            </h4>
            <button onClick={() => setSuggestions([])} className="text-violet-400 hover:text-violet-600"><X size={16}/></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {suggestions.map((s, idx) => (
              <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-violet-100 hover:shadow-md transition-shadow cursor-pointer" onClick={() => adoptSuggestion(s)}>
                 <div className="flex justify-between items-start mb-2">
                   <span className="text-2xl">{s.emoji}</span>
                   <span className="text-xs font-bold text-violet-600 bg-violet-100 px-2 py-1 rounded-full">+ Agregar</span>
                 </div>
                 <h5 className="font-bold text-gray-800 text-sm">{s.name}</h5>
                 <p className="text-xs text-gray-500 mb-1">{formatMoney(s.targetAmount)}</p>
                 <p className="text-xs text-violet-500 italic">"{s.reason}"</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Manual Add Form */}
      {showAddForm && suggestions.length === 0 && (
         <form onSubmit={handleAddGoal} className="mb-8 bg-gray-50 p-4 rounded-xl border border-gray-200 animate-fade-in flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Nombre de la Meta</label>
              <input type="text" value={newGoalName} onChange={e => setNewGoalName(e.target.value)} placeholder="Ej. Viaje a Japón" className="w-full p-2 rounded border border-gray-300 text-sm" required />
            </div>
            <div className="w-32">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Monto ($)</label>
              <input type="number" value={newGoalAmount} onChange={e => setNewGoalAmount(e.target.value)} placeholder="5000" className="w-full p-2 rounded border border-gray-300 text-sm" required />
            </div>
            <div>
               <label className="block text-xs font-semibold text-gray-500 mb-1">Emoji</label>
               <input type="text" value={newGoalEmoji} onChange={e => setNewGoalEmoji(e.target.value)} className="w-16 p-2 rounded border border-gray-300 text-center text-sm" />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-gray-900 text-white rounded text-sm hover:bg-gray-800">Guardar</button>
            </div>
         </form>
      )}

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.map(goal => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const isComplete = progress >= 100;
          
          return (
            <div key={goal.id} className={`relative p-5 rounded-xl border-2 transition-all ${isComplete ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:border-blue-200'}`}>
               {isComplete && (
                 <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-2 rounded-full shadow-lg animate-bounce">
                   <Trophy size={20} fill="white" />
                 </div>
               )}
               
               <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">
                   {goal.emoji}
                 </div>
                 <button onClick={() => onDeleteGoal(goal.id)} className="text-gray-300 hover:text-red-400">
                   <X size={16} />
                 </button>
               </div>

               <h4 className="font-bold text-gray-800 text-lg mb-1">{goal.name}</h4>
               <div className="flex justify-between items-baseline mb-3">
                 <span className="text-2xl font-bold text-gray-900">{formatMoney(goal.currentAmount)}</span>
                 <span className="text-sm text-gray-400">de {formatMoney(goal.targetAmount)}</span>
               </div>

               {/* Progress Bar */}
               <div className="w-full bg-gray-100 rounded-full h-3 mb-4 overflow-hidden">
                 <div 
                    className={`h-full rounded-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-blue-600'}`}
                    style={{ width: `${progress}%` }}
                 ></div>
               </div>

               {/* Gamification / Action */}
               {!isComplete ? (
                 <div className="flex justify-between items-center mt-4">
                    <span className="text-xs font-medium text-blue-600 flex items-center gap-1">
                      <Rocket size={12} />
                      {Math.ceil((goal.targetAmount - goal.currentAmount) / (transactions.length > 0 ? 200 : 100))} meses est.
                    </span>
                    <button 
                      onClick={() => addFunds(goal)}
                      className="text-xs bg-gray-900 text-white px-3 py-1.5 rounded-full hover:bg-gray-700 transition-colors"
                    >
                      + Depositar
                    </button>
                 </div>
               ) : (
                 <div className="mt-4 text-center">
                   <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                     ¡META COMPLETADA!
                   </span>
                 </div>
               )}
            </div>
          );
        })}
        
        {goals.length === 0 && !showAddForm && (
           <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 text-gray-400">
             <Target size={48} className="mx-auto mb-3 opacity-20" />
             <p>No tienes objetivos activos.</p>
             <button onClick={() => setShowAddForm(true)} className="text-indigo-600 font-semibold hover:underline mt-2">Crear mi primer objetivo</button>
           </div>
        )}
      </div>
    </div>
  );
};
