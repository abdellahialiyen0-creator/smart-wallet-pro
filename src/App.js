import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusCircle, TrendingUp, TrendingDown, Wallet, Trash2,
  List as ListIcon, X, Edit3, Target, FileText, Settings,
  ArrowUpRight, PieChart as PieIcon, DollarSign, Award,
  CheckCircle2, AlertTriangle, Activity
} from 'lucide-react';
import {
  PieChart, Pie, Cell, XAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import confetti from 'canvas-confetti';

// --- Constants ---
const CATEGORIES = {
  food: { name: 'طعام', nameEn: 'Food', color: '#f59e0b', icon: '🍔', type: 'expense' },
  transport: { name: 'مواصلات', nameEn: 'Transport', color: '#3b82f6', icon: '🚗', type: 'expense' },
  bills: { name: 'فواتير', nameEn: 'Bills', color: '#ef4444', icon: '📄', type: 'expense' },
  entertainment: { name: 'ترفيه', nameEn: 'Entertainment', color: '#8b5cf6', icon: '🎮', type: 'expense' },
  health: { name: 'صحة', nameEn: 'Health', color: '#10b981', icon: '💊', type: 'expense' },
  shopping: { name: 'تسوق', nameEn: 'Shopping', color: '#ec4899', icon: '🛍️', type: 'expense' },
  other: { name: 'أخرى', nameEn: 'Other', color: '#6b7280', icon: '📦', type: 'expense' },
  salary: { name: 'راتب', nameEn: 'Salary', color: '#059669', icon: '💰', type: 'income' },
  freelance: { name: 'فريلانس', nameEn: 'Freelance', color: '#0891b2', icon: '💻', type: 'income' },
  gift: { name: 'هدية', nameEn: 'Gift', color: '#d946ef', icon: '🎁', type: 'income' }
};

export default function ExpenseTracker() {
  // --- States ---
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('et-transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('et-budgets');
    return saved ? JSON.parse(saved) : {};
  });

  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('et-goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [currency] = useState(() => localStorage.getItem('et-currency') || 'MRU');

  const [showModal, setShowModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense',
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0'
  });

  const [allocationGoal, setAllocationGoal] = useState(null);
  const [allocateAmount, setAllocateAmount] = useState('');

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('et-transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('et-budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('et-goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    document.title = "محفظتي الذكية | My Smart Wallet";
  }, []);

  // --- Handlers ---
  const saveTransaction = () => {
    if (!newTransaction.amount || parseFloat(newTransaction.amount) <= 0) {
      toast.error('الرجاء إدخال مبلغ صحيح');
      return;
    }

    const amount = parseFloat(newTransaction.amount);
    if (editingId) {
      setTransactions(transactions.map(t =>
        t.id === editingId ? { ...newTransaction, id: editingId, amount } : t
      ));
      toast.success('تم التحديث بنجاح');
    } else {
      const transaction = { id: Date.now(), ...newTransaction, amount };
      setTransactions([transaction, ...transactions]);
      toast.success('تمت الإضافة بنجاح');
    }

    setShowModal(false);
    resetForm();
  };

  const addGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount) {
      toast.error('أكمل بيانات الهدف');
      return;
    }
    const goal = { ...newGoal, id: Date.now(), currentAmount: parseFloat(newGoal.currentAmount), targetAmount: parseFloat(newGoal.targetAmount) };
    setGoals([...goals, goal]);
    setShowGoalModal(false);
    setNewGoal({ title: '', targetAmount: '', currentAmount: '0' });
    toast.success('هدف جديد مضاف!');
  };

  const allocateToGoal = () => {
    const amount = parseFloat(allocateAmount);
    if (!amount || amount <= 0) {
      toast.error('أدخل مبلغاً صحيحاً');
      return;
    }
    if (amount > stats.balance) {
      toast.error('الرصيد غير كافٍ');
      return;
    }

    const updatedGoals = goals.map(g => {
      if (g.id === allocationGoal.id) {
        const newTotal = g.currentAmount + amount;
        if (newTotal >= g.targetAmount && g.currentAmount < g.targetAmount) {
          triggerCelebration();
        }
        return { ...g, currentAmount: newTotal };
      }
      return g;
    });

    setGoals(updatedGoals);

    // Create a transaction to reflect the "saving" as an expense from general funds
    const savingTx = {
      id: Date.now(),
      type: 'expense',
      amount: amount,
      category: 'other',
      description: `ادخار لهدف: ${allocationGoal.title}`,
      date: new Date().toISOString().split('T')[0]
    };
    setTransactions([savingTx, ...transactions]);

    setAllocationGoal(null);
    setAllocateAmount('');
    toast.success('تم التوفير بنجاح! 🎯');
  };

  const triggerCelebration = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    toast.success('مبرووووك! لقد حققت هدف الادخار 🏆', {
      duration: 6000,
      icon: '🎉',
      style: {
        borderRadius: '20px',
        background: '#1e293b',
        color: '#fff',
        border: '1px solid #6366f1'
      }
    });
  };

  const deleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
    toast.success('تم حذف الهدف');
  };

  const handleEdit = (t) => {
    setNewTransaction({ ...t, amount: t.amount.toString() });
    setEditingId(t.id);
    setShowModal(true);
  };

  const updateBudget = (cat, amount) => {
    setBudgets({ ...budgets, [cat]: parseFloat(amount) || 0 });
  };

  const resetForm = () => {
    setNewTransaction({
      type: 'expense',
      amount: '',
      category: 'food',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setEditingId(null);
  };

  const deleteTransaction = (id) => {
    toast((t) => (
      <span className="flex items-center gap-3">
        متأكد من الحذف؟
        <button onClick={() => {
          setTransactions(transactions.filter(tr => tr.id !== id));
          toast.dismiss(t.id);
          toast.success('تم الحذف');
        }} className="bg-rose-500 text-white px-2 py-1 rounded">نعم</button>
      </span>
    ));
  };

  const clearAllData = () => {
    toast((t) => (
      <div className="flex flex-col gap-4 p-2">
        <div className="flex items-center gap-3 text-rose-400 font-black">
          <AlertTriangle className="w-5 h-5" />
          <span>تحذير: سيتم حذف كل شيء!</span>
        </div>
        <p className="text-xs text-slate-400 font-bold">هذه العملية ستمسح السجل، الأهداف، والميزانيات نهائياً.</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setTransactions([]);
              setBudgets({});
              setGoals([]);
              localStorage.clear();
              toast.dismiss(t.id);
              setShowBudgetModal(false);
              toast.success('تمت إعادة ضبط التطبيق بنجاح');
              setTimeout(() => window.location.reload(), 1000);
            }}
            className="flex-1 bg-rose-500 text-white py-2 rounded-xl font-black text-xs"
          >
            نعم، احذف الكل
          </button>
          <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-slate-700 text-white py-2 rounded-xl font-black text-xs">إلغاء</button>
        </div>
      </div>
    ), { duration: 6000, position: 'top-center' });
  };

  // --- Logic ---
  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  // Financial Health Score Logic
  const healthScore = useMemo(() => {
    if (stats.income === 0 && stats.expense === 0) return 100;
    if (stats.income === 0) return 0;

    let score = 100;
    const expenseRatio = stats.expense / stats.income;
    score -= expenseRatio * 80; // Penalize for spending a lot of income

    // Bonus for goals progress
    if (goals.length > 0) {
      const avgProgress = goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length;
      score += avgProgress * 20;
    }

    return Math.max(Math.min(Math.round(score), 100), 0);
  }, [stats, goals]);

  const healthData = useMemo(() => {
    if (healthScore >= 80) return { label: 'ممتاز', color: 'text-emerald-400', ic: Award, msg: 'أنت تدير أموالك باحترافية عالية!' };
    if (healthScore >= 50) return { label: 'جيد', color: 'text-cyan-400', ic: CheckCircle2, msg: 'وضعك جيد، حاول تقليل المصاريف الجانبية.' };
    return { label: 'غير مستقر', color: 'text-rose-400', ic: AlertTriangle, msg: 'احذر! مصاريفك قد تتجاوز استقرارك المالي.' };
  }, [healthScore]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t =>
      (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      CATEGORIES[t.category].name.includes(searchQuery)
    );
  }, [transactions, searchQuery]);

  const chartData = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.id - b.id;
      })
      .slice(-10)
      .map(t => ({
        ...t,
        val: t.type === 'income' ? t.amount : -t.amount,
        displayAmount: t.amount,
        categoryName: CATEGORIES[t.category]?.name
      }));
  }, [transactions]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) groups[t.date] = [];
      groups[t.date].push(t);
    });
    return Object.keys(groups).sort((a, b) => new Date(b) - new Date(a)).map(date => ({
      date,
      items: groups[date],
      totalIncome: groups[date].filter(x => x.type === 'income').reduce((s, x) => s + x.amount, 0),
      totalExpense: groups[date].filter(x => x.type === 'expense').reduce((s, x) => s + x.amount, 0)
    }));
  }, [filteredTransactions]);

  const categorySpending = useMemo(() => {
    return Object.keys(CATEGORIES)
      .filter(cat => CATEGORIES[cat].type === 'expense')
      .map(cat => {
        const spent = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
        return { id: cat, name: CATEGORIES[cat].name, icon: CATEGORIES[cat].icon, spent, budget: budgets[cat] || 0, color: CATEGORIES[cat].color };
      })
      .filter(item => item.spent > 0 || item.budget > 0);
  }, [transactions, budgets]);

  const formatCurrency = (amount) => {
    return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " " + currency;
  };

  // --- PDF Export ---
  const exportPDF = () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4');

      // الترويسة بالإنجليزية لضمان عدم حدوث أخطاء في الخطوط
      doc.setFontSize(20);
      doc.setTextColor(40);
      doc.text('Smart Wallet - Financial Report', 40, 50);

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 40, 70);

      // تحويل البيانات للإنجليزية للتقرير فقط لضمان سلامة النصوص
      const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

      const tableData = transactions.map(t => {
        const cat = CATEGORIES[t.category] || CATEGORIES.other;
        // إذا كان الوصف عربياً، نستخدم اسم الفئة بالإنجليزي بدلاً منه لتجنب التشويه
        const safeDescription = (t.description && !isArabic(t.description))
          ? t.description
          : cat.nameEn;

        return [
          t.date,
          safeDescription,
          cat.nameEn,
          t.type.toUpperCase(),
          `${t.amount} ${currency}`
        ];
      });

      autoTable(doc, {
        head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
        body: tableData,
        startY: 90,
        styles: { fontSize: 9, cellPadding: 6 },
        headStyles: { fillColor: [6, 182, 212] }, // لون Cyan الخاص بالتطبيق
      });

      doc.save(`Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('تم تصدير التقرير بنجاح (PDF)');
    } catch (error) {
      console.error(error);
      toast.error('حدث خطأ أثناء تصدير الملف');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 selection:bg-cyan-500/30 font-sans rtl pb-20 md:pb-0">
      <Toaster position="top-center" reverseOrder={false} />

      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-cyan-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute top-[20%] right-[10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-3 md:p-10 space-y-4 md:space-y-10">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 md:p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="p-3 md:p-4 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl md:rounded-3xl shadow-xl">
              <Wallet className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </motion.div>
            <div className="text-right">
              <h1 className="text-xl md:text-3xl font-black text-white leading-tight">محفظتي الذكية</h1>
              <p className="text-slate-500 text-[10px] md:text-sm font-bold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> نظام مالي ذكي
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 md:flex items-center justify-center gap-2 md:gap-3 w-full md:w-auto">
            <button onClick={exportPDF} title="تقرير PDF" className="aspect-square md:aspect-auto flex items-center justify-center p-3 md:p-4 bg-slate-900 border border-slate-700/50 rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all text-slate-400 hover:text-emerald-400">
              <FileText className="w-5 h-5" />
            </button>
            <button onClick={() => setShowGoalModal(true)} title="أهداف جديدة" className="aspect-square md:aspect-auto flex items-center justify-center p-3 md:p-4 bg-slate-900 border border-slate-700/50 rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all text-slate-400 hover:text-indigo-400">
              <Target className="w-5 h-5" />
            </button>
            <button onClick={() => setShowBudgetModal(true)} title="الإعدادات" className="aspect-square md:aspect-auto flex items-center justify-center p-3 md:p-4 bg-slate-900 border border-slate-700/50 rounded-xl md:rounded-2xl hover:bg-slate-800 transition-all text-slate-400 hover:text-cyan-400">
              <Settings className="w-5 h-5" />
            </button>
            <button onClick={() => { resetForm(); setShowModal(true); }} className="col-span-1 md:flex-none flex items-center justify-center gap-2 p-3 md:px-8 md:py-4 bg-gradient-to-r from-cyan-600 to-blue-700 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-cyan-950 transition-all hover:scale-[1.02] active:scale-95 text-[10px] md:text-base">
              <PlusCircle className="w-4 h-4 md:w-5 md:h-5" /> <span className="hidden sm:inline">عملية جديدة</span>
              <PlusCircle className="w-5 h-5 sm:hidden" />
            </button>
          </div>
        </header>

        {/* Global Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Health Score Card */}
          <motion.div whileHover={{ y: -5 }} className="lg:col-span-1 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest">الصحة المالية</h3>
                <Activity className="w-5 h-5 text-cyan-500" />
              </div>
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364.4} strokeDashoffset={364.4 - (364.4 * healthScore) / 100} className={`${healthData.color} transition-all duration-1000`} />
                  </svg>
                  <span className={`absolute text-3xl font-black ${healthData.color}`}>{healthScore}</span>
                </div>
                <div className="text-center">
                  <div className={`flex items-center justify-center gap-2 font-black ${healthData.color} mb-1 italic`}>
                    <healthData.ic className="w-4 h-4" /> {healthData.label}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{healthData.msg}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] group-hover:bg-cyan-500/10 transition-all"></div>
          </motion.div>

          {/* Core Stats */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'إجمالي الدخل', val: stats.income, color: 'text-emerald-400', ic: TrendingUp, bg: 'from-emerald-500/10 to-transparent' },
              { label: 'إجمالي المصاريف', val: stats.expense, color: 'text-rose-400', ic: TrendingDown, bg: 'from-rose-500/10 to-transparent' },
              { label: 'الرصيد المتاح', val: stats.balance, color: 'text-cyan-400', ic: Wallet, bg: 'from-cyan-500/10 to-transparent' }
            ].map((s, i) => (
              <motion.div key={i} whileHover={{ y: -5 }} className={`bg-gradient-to-b ${s.bg} border border-white/5 p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-md`}>
                <div className="flex items-center gap-3 mb-4 md:mb-6 opacity-60">
                  <s.ic className={`w-4 h-4 md:w-5 md:h-5 ${s.color}`} />
                  <span className="text-xs md:text-sm font-bold">{s.label}</span>
                </div>
                <h2 className={`text-xl md:text-3xl font-black ${s.color} flex items-center justify-between`}>
                  {formatCurrency(s.val)}
                  <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 opacity-20" />
                </h2>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          <div className="lg:col-span-2 space-y-10">
            {/* Overview Chart */}
            <div className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-[2.5rem] relative group/chart">
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 to-transparent opacity-0 group-hover/chart:opacity-100 transition-opacity rounded-[2.5rem] pointer-events-none"></div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-3 text-white">
                    <div className="p-2 bg-cyan-500/20 rounded-lg">
                      <Activity className="w-5 h-5 text-cyan-400" />
                    </div>
                    نظرة تحليلية
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse delay-75"></div>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 bg-slate-900/50 px-4 py-2 rounded-full border border-slate-700/50 tracking-tighter uppercase">Live Insights</div>
                </div>
              </div>
              <div className="h-[300px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#06b6d4" stopOpacity={0.1} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                          <feMergeNode in="coloredBlur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                    <XAxis dataKey="id" hide />
                    <Tooltip
                      cursor={{ stroke: '#334155', strokeWidth: 1 }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <motion.div
                              initial={{ opacity: 0, y: 10, scale: 0.9 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 p-5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] min-w-[200px]"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{data.date}</span>
                                <div className={`w-2 h-2 rounded-full ${data.type === 'income' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-rose-500 shadow-[0_0_10px_#ef4444]'}`}></div>
                              </div>
                              <div className="space-y-1">
                                <p className={`text-2xl font-black ${data.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                  {data.type === 'income' ? '+' : '-'}{formatCurrency(data.displayAmount)}
                                </p>
                                <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                                  <span className="opacity-50">{CATEGORIES[data.category]?.icon}</span>
                                  {data.categoryName}
                                </p>
                              </div>
                              {data.description && (
                                <div className="mt-4 pt-3 border-t border-white/5">
                                  <p className="text-[10px] text-slate-500 italic">"{data.description}"</p>
                                </div>
                              )}
                            </motion.div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="val"
                      stroke="#22d3ee"
                      strokeWidth={4}
                      fill="url(#colorWave)"
                      filter="url(#glow)"
                      dot={{ r: 5, fill: '#0f172a', stroke: '#22d3ee', strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: '#22d3ee', stroke: '#fff', strokeWidth: 2, shadow: '0 0 15px #22d3ee' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent History */}
            <div className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-[2.5rem] space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold flex items-center gap-3"><ListIcon className="text-cyan-500" /> سجل العمليات</h3>
                <div className="relative w-full sm:w-64">
                  <input type="text" placeholder="بحث سريع..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-6 py-3 text-sm focus:border-cyan-500 outline-none pr-12" />
                </div>
              </div>
              <div className="space-y-10 max-h-[600px] overflow-y-auto custom-scrollbar pr-4">
                {groupedTransactions.map(group => {
                  const today = new Date().toISOString().split('T')[0];
                  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                  let label = group.date;
                  if (group.date === today) label = 'اليوم';
                  else if (group.date === yesterday) label = 'أمس';

                  return (
                    <div key={group.date} className="space-y-4">
                      <div className="flex items-center justify-between px-2 sticky top-0 bg-slate-900/50 backdrop-blur-md py-2 z-10 rounded-xl">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
                          {label}
                        </h4>
                        <div className="flex gap-4 text-[10px] font-black">
                          {group.totalIncome > 0 && <span className="text-emerald-500">+{formatCurrency(group.totalIncome)}</span>}
                          {group.totalExpense > 0 && <span className="text-rose-500">-{formatCurrency(group.totalExpense)}</span>}
                        </div>
                      </div>

                      <div className="grid gap-3">
                        {group.items.map(t => (
                          <motion.div key={t.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="group flex items-center justify-between p-4 bg-slate-900/40 rounded-[1.5rem] border border-white/5 hover:border-cyan-500/30 hover:bg-slate-800/40 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                                {CATEGORIES[t.category]?.icon || '💰'}
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-200 text-sm mb-0.5">{t.description || CATEGORIES[t.category]?.name}</h5>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-800/50 px-2 py-0.5 rounded-md border border-white/5">
                                  {CATEGORIES[t.category]?.name}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-6">
                              <span className={`text-lg font-black ${t.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => handleEdit(t)} className="p-2 bg-slate-800 rounded-lg hover:text-cyan-400 border border-white/5"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteTransaction(t.id)} className="p-2 bg-slate-800 rounded-lg hover:text-rose-400 border border-white/5"><Trash2 className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {groupedTransactions.length === 0 && (
                  <div className="text-center py-20 opacity-30">
                    <ListIcon className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold">لا توجد عمليات مسجلة</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-10">
            {/* Savings Goals */}
            <div className="bg-gradient-to-br from-indigo-900/30 to-slate-900/40 border border-indigo-500/20 p-8 rounded-[2.5rem] relative overflow-hidden">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 text-indigo-400"><Target className="w-6 h-6" /> أهداف الادخار</h3>
              <div className="space-y-8 relative z-10">
                {goals.map(g => {
                  const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                  const isCompleted = progress >= 100;
                  return (
                    <div key={g.id} className={`space-y-4 p-5 rounded-3xl border transition-all ${isCompleted ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5 hover:bg-white/[0.07]'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-white text-lg flex items-center gap-2">
                            {g.title}
                            {isCompleted && <Award className="w-4 h-4 text-emerald-400" />}
                          </h4>
                          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">هدف الحلم</p>
                        </div>
                        <button onClick={() => deleteGoal(g.id)} className="p-1 text-slate-600 hover:text-rose-500 transition-colors"><X className="w-4 h-4" /></button>
                      </div>

                      <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]'}`} />
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className={`font-black ${isCompleted ? 'text-emerald-400' : 'text-indigo-400'}`}>{isCompleted ? 'مكتمل بنجاح!' : `${progress.toFixed(0)}% مكتمل`}</span>
                        <span className="text-slate-400">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</span>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={() => setAllocationGoal(g)}
                          className="w-full py-3 mt-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 text-xs font-black hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="w-4 h-4" /> توفير من الرصيد
                        </button>
                      )}
                    </div>
                  );
                })}
                {goals.length === 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center py-10 px-6 border-2 border-dashed border-indigo-500/20 rounded-[2rem] bg-indigo-500/5 group/add-goal transition-all hover:bg-indigo-500/10 active:scale-95 cursor-pointer" onClick={() => setShowGoalModal(true)}>
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover/add-goal:scale-110 transition-transform shadow-xl shadow-indigo-900/20">
                      <PlusCircle className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h4 className="font-black text-white mb-2">ابدأ رحلة الادخار</h4>
                    <p className="text-[10px] text-slate-500 font-bold leading-relaxed px-4">لا توجد أهداف نشطة حالياً. اضغط هنا لإضافة حلمك المالي الأول!</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Smart Spending Insights */}
            <div className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-[2.5rem]">
              <h3 className="text-lg font-black mb-8 flex items-center gap-3"><PieIcon className="text-cyan-500" /> تحليل الإنفاق</h3>
              <div className="h-[200px] mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categorySpending} dataKey="spent" innerRadius={60} outerRadius={80} stroke="none" paddingAngle={5}>
                      {categorySpending.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {categorySpending.slice(0, 5).map(c => {
                  const isExceeded = c.budget > 0 && c.spent > c.budget;
                  return (
                    <div key={c.id} className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-2 font-bold"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} /> {c.icon} {c.name}</span>
                        <span className={`font-black ${isExceeded ? 'text-rose-400' : 'text-slate-500'}`}>{formatCurrency(c.spent)}</span>
                      </div>
                      {c.budget > 0 && (
                        <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                          <div className={`h-full ${isExceeded ? 'bg-rose-500' : 'bg-slate-700'}`} style={{ width: `${Math.min((c.spent / c.budget) * 100, 100)}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {/* Transaction Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-end md:items-center justify-center p-0 md:p-4 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="bg-slate-800 border-t md:border border-slate-700 p-10 md:rounded-[3rem] w-full max-w-2xl z-10 relative">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black text-white">{editingId ? 'تعديل العملية' : 'سجل مالي جديد'}</h3>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-900 rounded-2xl hover:bg-slate-700 transition-colors"><X className="w-6 h-6" /></button>
              </div>

              <div className="space-y-8">
                <div className="flex bg-slate-900 p-2 rounded-2xl border border-slate-700">
                  <button onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: 'food' })} className={`flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 ${newTransaction.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-900/20' : 'text-slate-500'}`}>
                    <TrendingDown className="w-5 h-5" /> مصروف
                  </button>
                  <button onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: 'salary' })} className={`flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-3 ${newTransaction.type === 'income' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-900/20' : 'text-slate-500'}`}>
                    <TrendingUp className="w-5 h-5" /> دخل
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">المبلغ المالي</label>
                    <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                      <input type="number" placeholder="0.00" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} className="w-full bg-slate-900 border border-slate-700 px-14 py-5 rounded-[1.5rem] font-black text-2xl outline-none focus:border-cyan-500 transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">التصنيف</label>
                    <select value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] font-bold outline-none text-lg appearance-none cursor-pointer">
                      {Object.keys(CATEGORIES).filter(cat => CATEGORIES[cat].type === newTransaction.type).map(cat => (
                        <option key={cat} value={cat}>{CATEGORIES[cat].icon} {CATEGORIES[cat].name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">الوصف / البيان</label>
                  <input type="text" placeholder={newTransaction.type === 'income' ? "مثلاً: راتب الشركة، هدية..." : "مثلاً: شراء خضار، فاتورة كهرباء..."} value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] font-bold outline-none focus:border-cyan-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">تاريخ المعاملة</label>
                    <input type="date" value={newTransaction.date} onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-5 rounded-[1.5rem] font-bold outline-none" />
                  </div>
                  <button onClick={saveTransaction} className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-[1.5rem] font-black text-white text-lg shadow-2xl shadow-cyan-900/20 hover:scale-[1.01] active:scale-95 transition-all">
                    {editingId ? 'تحديث البيانات' : 'حفظ وسجل الآن'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Settings / Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowBudgetModal(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
            <motion.div className="bg-slate-800 border border-slate-700 p-10 rounded-[3rem] w-full max-w-2xl z-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-3xl font-black text-white flex items-center gap-4"><Settings className="text-cyan-500" /> إدارة الميزانيات</h3>
                <button onClick={() => setShowBudgetModal(false)} className="p-3 bg-slate-900 rounded-2xl transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="space-y-6">
                {Object.keys(CATEGORIES).filter(cat => CATEGORIES[cat].type === 'expense').map(cat => (
                  <div key={cat} className="flex items-center gap-6 p-6 bg-slate-900/50 rounded-[2rem] border border-white/5">
                    <div className="text-3xl p-4 bg-slate-800 rounded-2xl">{CATEGORIES[cat].icon}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{CATEGORIES[cat].name}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">الحد الأقصى للمصروف</p>
                    </div>
                    <div className="w-32">
                      <input type="number" value={budgets[cat] || ''} onChange={e => updateBudget(cat, e.target.value)} placeholder="0" className="w-full bg-slate-800 border border-white/10 p-4 rounded-xl text-center font-black focus:border-cyan-500 outline-none" />
                    </div>
                  </div>
                ))}
                <button onClick={() => { setShowBudgetModal(false); toast.success('تم حفظ إعدادات الميزانية'); }} className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl font-black text-white text-lg mt-4">تطبيق الإعدادات</button>

                <div className="mt-10 pt-8 border-t border-rose-500/20">
                  <h4 className="text-rose-400 font-black mb-4 flex items-center gap-2 px-2">
                    <AlertTriangle className="w-4 h-4" /> منطقة خطر
                  </h4>
                  <button onClick={clearAllData} className="w-full py-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-sm">
                    مسح كافة البيانات والبدء من جديد
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Goal Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setShowGoalModal(false)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
            <motion.div className="bg-slate-800 border border-slate-700 p-10 rounded-[3rem] w-full max-w-md z-10 relative">
              <h3 className="text-2xl font-black mb-8 text-center flex items-center justify-center gap-3 text-white"><Target className="text-cyan-500 w-8 h-8" /> خطة ادخار جديدة</h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 px-2 uppercase tracking-widest">اسم الهدف</label>
                  <input placeholder="مثلاً: شراء لابتوب جديد" value={newGoal.title} onChange={e => setNewGoal({ ...newGoal, title: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-5 rounded-2xl font-bold outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 px-2 uppercase tracking-widest">المبلغ المطلوب</label>
                  <input type="number" placeholder="0.00" value={newGoal.targetAmount} onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="w-full bg-slate-900 border border-slate-700 p-5 rounded-2xl font-black text-xl outline-none" />
                </div>
                <button onClick={addGoal} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-black text-white text-lg transition-all shadow-xl shadow-cyan-900/20 mt-4">ابدأ الحلم الآن</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Allocation Modal (Top up goal) */}
        {allocationGoal && (
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[100]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setAllocationGoal(null)} className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" />
            <motion.div className="bg-slate-800 border border-slate-700 p-10 rounded-[3rem] w-full max-w-md z-10 relative">
              <h3 className="text-2xl font-black mb-4 text-center text-white">تحويل مبلغ للهدف</h3>
              <p className="text-center text-slate-500 mb-8 font-bold text-sm">أضف رصيداً لـ <span className="text-indigo-400">"{allocationGoal.title}"</span> من رصيدك الحالي</p>
              <div className="space-y-6">
                <div className="relative">
                  <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="number" placeholder="أدخل المبلغ..." value={allocateAmount} onChange={e => setAllocateAmount(e.target.value)} className="w-full bg-slate-900 border border-slate-700 px-14 py-5 rounded-2xl font-black text-2xl outline-none focus:border-indigo-500" />
                </div>
                <div className="flex justify-between items-center px-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">رصيدك المتاح:</span>
                  <span className="text-sm font-black text-emerald-400">{formatCurrency(stats.balance)}</span>
                </div>
                <button onClick={allocateToGoal} className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-white text-lg transition-all shadow-xl shadow-indigo-900/20">تأكيد التحويل</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); }
        .rtl { direction: rtl; }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        }
      `}</style>
    </div>
  );
}