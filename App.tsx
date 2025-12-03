
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  TrendingDown, 
  PiggyBank, 
  Plus, 
  Trash2,
  DollarSign,
  Download,
  Globe,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Transaction, TransactionType, Period, SavingsGoal, UserSettings, PaymentFrequency, User } from './types';
import { TransactionModal } from './components/TransactionModal';
import { FinancialCharts } from './components/FinancialCharts';
import { AiAdvisor } from './components/AiAdvisor';
import { FinancialHealth } from './components/FinancialHealth';
import { PredictiveBudget } from './components/PredictiveBudget';
import { SmartGoals } from './components/SmartGoals';
import { FinancialScore } from './components/FinancialScore';
import { ColombianContextWidget } from './components/ColombianContextWidget';
import { SocialComparison } from './components/SocialComparison';
import { AuthScreen } from './components/AuthScreen';
import { authService } from './services/authService';

// Example Data for "Load Demo" functionality (Adjusted for generic context initially)
const EXAMPLE_DATA: Transaction[] = [
  { id: '1', name: 'Salario', amount: 3500, type: TransactionType.INCOME, category: 'Salario', date: new Date().toISOString() },
  { id: '2', name: 'Alquiler', amount: 1200, type: TransactionType.EXPENSE, category: 'Vivienda/Arriendo', date: new Date().toISOString() },
  { id: '3', name: 'Mercado', amount: 450, type: TransactionType.EXPENSE, category: 'Mercado', date: new Date().toISOString() },
  { id: '4', name: 'Transporte', amount: 150, type: TransactionType.EXPENSE, category: 'Transporte', date: new Date().toISOString() },
];

function App() {
  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // App Data State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
      currency: 'USD',
      locale: 'en-US',
      isColombianMode: false,
      paymentFrequency: PaymentFrequency.MONTHLY
  });

  // UI State
  const [period, setPeriod] = useState<Period>(Period.MONTHLY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>(TransactionType.EXPENSE);

  // Check for active session on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoadingAuth(false);
  }, []);

  // Load Data specific to user when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const savedData = localStorage.getItem(`budgetMateData_${currentUser.id}`);
      const savedGoals = localStorage.getItem(`budgetMateGoals_${currentUser.id}`);
      const savedSettings = localStorage.getItem(`budgetMateSettings_${currentUser.id}`);

      setTransactions(savedData ? JSON.parse(savedData) : []);
      setGoals(savedGoals ? JSON.parse(savedGoals) : []);
      setSettings(savedSettings ? JSON.parse(savedSettings) : {
        currency: 'USD',
        locale: 'en-US',
        isColombianMode: false,
        paymentFrequency: PaymentFrequency.MONTHLY
      });
    } else {
      // Clear data if logged out
      setTransactions([]);
      setGoals([]);
    }
  }, [currentUser]);

  // Save Data when it changes (Only if user exists)
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`budgetMateData_${currentUser.id}`, JSON.stringify(transactions));
    }
  }, [transactions, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`budgetMateGoals_${currentUser.id}`, JSON.stringify(goals));
    }
  }, [goals, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`budgetMateSettings_${currentUser.id}`, JSON.stringify(settings));
    }
  }, [settings, currentUser]);

  // Derived Calculations
  const periodMultiplier = period === Period.MONTHLY ? 1 : 12;

  const totals = useMemo(() => {
    const calc = (type: TransactionType) => 
      transactions
        .filter(t => t.type === type)
        .reduce((acc, curr) => acc + curr.amount, 0) * periodMultiplier;

    const income = calc(TransactionType.INCOME);
    const expenses = calc(TransactionType.EXPENSE);
    const savings = calc(TransactionType.SAVING);

    return {
      income,
      expenses,
      savings,
      balance: income - expenses - savings
    };
  }, [transactions, periodMultiplier]);

  const addTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID()
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addGoal = (goal: SavingsGoal) => {
    setGoals(prev => [...prev, goal]);
  };

  const updateGoal = (updatedGoal: SavingsGoal) => {
    setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const loadExampleData = () => {
    if (settings.isColombianMode) {
       setTransactions([
        { id: 'c1', name: 'Nómina Quincena 1', amount: 1800000, type: TransactionType.INCOME, category: 'Salario', date: new Date().toISOString() },
        { id: 'c2', name: 'Nómina Quincena 2', amount: 1800000, type: TransactionType.INCOME, category: 'Salario', date: new Date().toISOString() },
        { id: 'c3', name: 'Arriendo Apto', amount: 1200000, type: TransactionType.EXPENSE, category: 'Vivienda/Arriendo', date: new Date().toISOString() },
        { id: 'c4', name: 'Mercado D1/Ara', amount: 600000, type: TransactionType.EXPENSE, category: 'Mercado', date: new Date().toISOString() },
        { id: 'c5', name: 'Recarga Transmilenio', amount: 150000, type: TransactionType.EXPENSE, category: 'Transporte', date: new Date().toISOString() },
        { id: 'c6', name: 'Corrientazos', amount: 200000, type: TransactionType.EXPENSE, category: 'Corrientazo', date: new Date().toISOString() },
      ]);
      setGoals([
         { id: 'g1', name: 'Prima Diciembre', targetAmount: 2000000, currentAmount: 500000, emoji: '🎄', color: '#10B981' }
      ]);
    } else {
      setTransactions(EXAMPLE_DATA);
      setGoals([
        { id: 'g1', name: 'Fondo de Emergencia', targetAmount: 5000, currentAmount: 1200, emoji: '🚑', color: '#EF4444' },
      ]);
    }
  };

  const openAddModal = (type: TransactionType) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const toggleColombianMode = () => {
    const isColombian = !settings.isColombianMode;
    setSettings({
      currency: isColombian ? 'COP' : 'USD',
      locale: isColombian ? 'es-CO' : 'en-US',
      isColombianMode: isColombian,
      paymentFrequency: isColombian ? PaymentFrequency.BIWEEKLY : PaymentFrequency.MONTHLY
    });
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(settings.locale, {
      style: 'currency',
      currency: settings.currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const rawSavingsPotential = totals.savings + (totals.balance > 0 ? totals.balance : 0);
  const savingsRate = totals.income > 0 ? rawSavingsPotential / totals.income : 0;

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20 font-sans">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <LayoutDashboard className="text-white h-6 w-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-600 hidden sm:block">
                BudgetMate
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Colombian Mode Toggle */}
              <button
                onClick={toggleColombianMode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  settings.isColombianMode 
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-800' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {settings.isColombianMode ? (
                  <><span>🇨🇴</span> Modo COL</>
                ) : (
                  <><Globe size={14}/> Global</>
                )}
              </button>

              {/* User Profile / Logout */}
              <div className="flex items-center gap-2 border-l pl-3 ml-1 border-gray-200">
                <div className="flex items-center gap-2 text-right hidden md:block">
                   <div className="text-xs font-bold text-gray-700">{currentUser.name}</div>
                </div>
                <img 
                  src={currentUser.avatar} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full bg-gray-200 border border-gray-300" 
                />
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut size={18} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Hola, {currentUser.name.split(' ')[0]} 👋
            </h1>
            <p className="text-gray-500">
              {settings.isColombianMode 
                ? 'Organiza tus lucas, quincena a quincena.' 
                : 'Tu resumen financiero está listo.'}
            </p>
            <div className="mt-2 flex gap-1">
                 <button
                  onClick={() => setPeriod(Period.MONTHLY)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    period === Period.MONTHLY ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Vista Mensual
                </button>
                <button
                  onClick={() => setPeriod(Period.ANNUAL)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    period === Period.ANNUAL ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  Vista Anual
                </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => openAddModal(TransactionType.INCOME)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Ingreso</span>
            </button>
            <button 
               onClick={() => openAddModal(TransactionType.EXPENSE)}
               className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Gasto</span>
            </button>
             <button 
               onClick={() => openAddModal(TransactionType.SAVING)}
               className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Ahorro</span>
            </button>
          </div>
        </div>

        {/* Colombian Context Widget */}
        <ColombianContextWidget settings={settings} totalIncome={totals.income} />

        {/* Empty State */}
        {transactions.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Comienza tu viaje financiero</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              {settings.isColombianMode 
                ? 'Aquí no juzgamos si gastas en empanadas. Registra tu primera quincena.' 
                : 'Registra tu primer ingreso para desbloquear todas las funciones de IA.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => openAddModal(TransactionType.INCOME)}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-200 flex items-center gap-2"
              >
                <Plus size={20} /> Registrar Ingreso
              </button>
              <button 
                onClick={loadExampleData}
                className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-xl border border-gray-200 transition-all flex items-center gap-2"
              >
                <Download size={20} /> Cargar Datos {settings.isColombianMode ? 'Colombia' : 'Demo'}
              </button>
            </div>
          </div>
        )}

        {transactions.length > 0 && (
          <>
            {/* Financial Score Hero Section */}
            <FinancialScore transactions={transactions} />

            {/* Social Comparison / Wrapped Section (New) */}
            <SocialComparison 
              transactions={transactions} 
              totalIncome={totals.income}
              savingsRate={savingsRate}
              settings={settings}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
               {/* AI Advisor Section */}
              <div className="flex-1">
                <AiAdvisor 
                  transactions={transactions} 
                  period={period} 
                  totalIncome={totals.income} 
                  totalExpenses={totals.expenses + totals.savings}
                  settings={settings}
                />
              </div>

               {/* Predictive Budget Section */}
              <div className="flex-1">
                <PredictiveBudget 
                  transactions={transactions} 
                  totalExpenses={totals.expenses} 
                />
              </div>
            </div>

            {/* Smart Goals Section - Full Width */}
            <SmartGoals 
              goals={goals} 
              transactions={transactions} 
              savingsRate={savingsRate}
              onAddGoal={addGoal}
              onUpdateGoal={updateGoal}
              onDeleteGoal={deleteGoal}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Wallet className="text-emerald-500" size={24} />
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">+Ingresos</span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Ingresos</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(totals.income)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-red-50 rounded-xl">
                    <TrendingDown className="text-red-500" size={24} />
                  </div>
                  <span className="text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">-Gastos</span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Gastos</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(totals.expenses)}</h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <PiggyBank className="text-blue-500" size={24} />
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Ahorros</span>
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Total Ahorrado</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-gray-800">{formatCurrency(totals.savings)}</h3>
                </div>
              </div>

              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-white/10 rounded-xl">
                    <DollarSign className="text-white" size={24} />
                  </div>
                  <span className="text-xs font-semibold text-white/80 bg-white/10 px-2 py-1 rounded-full">Disponible</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium">Balance Neto</p>
                  <h3 className="text-xl lg:text-2xl font-bold text-white">{formatCurrency(totals.balance)}</h3>
                </div>
              </div>
            </div>

            {/* Financial Health & Alerts */}
            <FinancialHealth transactions={transactions} />

            {/* Charts */}
            <FinancialCharts transactions={transactions} periodMultiplier={periodMultiplier} />

            {/* Transaction Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Income List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Ingresos
                  </h3>
                  <span className="text-sm font-bold text-emerald-600">{formatCurrency(totals.income)}</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {transactions.filter(t => t.type === TransactionType.INCOME).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                      <Wallet size={32} className="mb-2 opacity-20" />
                      Sin ingresos registrados
                    </div>
                  )}
                  {transactions.filter(t => t.type === TransactionType.INCOME).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-emerald-600">+{formatCurrency(t.amount * periodMultiplier)}</span>
                        <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expenses List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div> Gastos
                  </h3>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(totals.expenses)}</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {transactions.filter(t => t.type === TransactionType.EXPENSE).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                      <TrendingDown size={32} className="mb-2 opacity-20" />
                      Sin gastos registrados
                    </div>
                  )}
                  {transactions.filter(t => t.type === TransactionType.EXPENSE).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-red-600">-{formatCurrency(t.amount * periodMultiplier)}</span>
                        <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings List */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[500px]">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Ahorros
                  </h3>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(totals.savings)}</span>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                  {transactions.filter(t => t.type === TransactionType.SAVING).length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm">
                      <PiggyBank size={32} className="mb-2 opacity-20" />
                      Sin ahorros definidos
                    </div>
                  )}
                  {transactions.filter(t => t.type === TransactionType.SAVING).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg group transition-colors">
                      <div>
                        <p className="font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-blue-600">{formatCurrency(t.amount * periodMultiplier)}</span>
                        <button onClick={() => removeTransaction(t.id)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={addTransaction}
        initialType={modalType}
      />
    </div>
  );
}

export default App;
