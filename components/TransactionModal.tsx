import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CATEGORIES } from '../types';
import { X, Check } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  initialType?: TransactionType;
}

export const TransactionModal: React.FC<Props> = ({ isOpen, onClose, onSave, initialType = TransactionType.EXPENSE }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(initialType);
  const [category, setCategory] = useState('');

  useEffect(() => {
    if (isOpen) {
      setType(initialType);
      setName('');
      setAmount('');
      setCategory(CATEGORIES[initialType][0]);
    }
  }, [isOpen, initialType]);

  useEffect(() => {
    // Reset category when type changes
    setCategory(CATEGORIES[type][0]);
  }, [type]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !category) return;

    onSave({
      name,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Agregar Movimiento</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type Selector */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            {(Object.keys(TransactionType) as Array<keyof typeof TransactionType>).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(TransactionType[t])}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  type === TransactionType[t]
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'INCOME' ? 'Ingreso' : t === 'EXPENSE' ? 'Gasto' : 'Ahorro'}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre / Concepto</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Salario, Alquiler, Cine..."
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Mensual</label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                required
                min="0"
                step="0.01"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Ingresa el valor mensual.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {CATEGORIES[type].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Guardar Movimiento
          </button>
        </form>
      </div>
    </div>
  );
};