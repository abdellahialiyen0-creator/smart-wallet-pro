import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../constants/categories';
import { triggerCelebration } from '../utils/helpers';

/**
 * السياق العام للتطبيق (AppContext)
 * يدير جميع البيانات والعمليات الأساسية مثل إضافة العمليات، الأهداف، والميزانيات
 */
const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- الحالات (States) - تخزين البيانات في المتصفح ---

    // سجل العمليات المالية
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('et-transactions');
        return saved ? JSON.parse(saved) : [];
    });

    // العمليات المتكررة الأساسية (المفاتيح)
    const [recurringConfigs, setRecurringConfigs] = useState(() => {
        const saved = localStorage.getItem('et-recurring-configs');
        return saved ? JSON.parse(saved) : [];
    });

    // ميزانيات الفئات
    const [budgets, setBudgets] = useState(() => {
        const saved = localStorage.getItem('et-budgets');
        return saved ? JSON.parse(saved) : {};
    });

    // أهداف الادخار
    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('et-goals');
        return saved ? JSON.parse(saved) : [];
    });

    // الثيم المختار
    const [theme, setTheme] = useState(() => localStorage.getItem('et-theme') || 'corporate');

    // العملة المستخدمة
    const [currency, setCurrency] = useState(() => localStorage.getItem('et-currency') || 'MRU');

    // حالات التحكم في واجهة المستخدم
    const [showModal, setShowModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [showShortcuts, setShowShortcuts] = useState(false);

    // نظام التصفية المتقدم (Advanced Filtering)
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: 'all',
        minAmount: '',
        type: 'all' // 'all', 'income', 'expense'
    });

    // الحالة المؤقتة لعملية جديدة
    const [newTransaction, setNewTransaction] = useState({
        type: 'expense',
        amount: '',
        category: 'food',
        description: '',
        date: new Date().toISOString().split('T')[0],
        recurring: 'none' // 'none', 'daily', 'weekly', 'monthly', 'yearly'
    });

    // الحالة المؤقتة لهدف جديد
    const [newGoal, setNewGoal] = useState({
        title: '',
        targetAmount: '',
        currentAmount: '0'
    });

    const [allocationGoal, setAllocationGoal] = useState(null);
    const [allocateAmount, setAllocateAmount] = useState('');

    // --- حفظ البيانات تلقائياً ---
    useEffect(() => {
        localStorage.setItem('et-transactions', JSON.stringify(transactions));
    }, [transactions]);

    useEffect(() => {
        localStorage.setItem('et-recurring-configs', JSON.stringify(recurringConfigs));
    }, [recurringConfigs]);

    useEffect(() => {
        localStorage.setItem('et-budgets', JSON.stringify(budgets));
    }, [budgets]);

    useEffect(() => {
        localStorage.setItem('et-goals', JSON.stringify(goals));
    }, [goals]);

    useEffect(() => {
        localStorage.setItem('et-theme', theme);
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('et-currency', currency);
    }, [currency]);

    // --- منطق العمليات المتكررة (Recurring Logic) ---
    useEffect(() => {
        const checkRecurring = () => {
            const today = new Date();
            let hasNewTransactions = false;
            let updatedConfigs = [...recurringConfigs];
            let newTxToAdd = [];

            updatedConfigs = updatedConfigs.map(config => {
                let nextDate = new Date(config.nextExecution);
                let currentConfig = { ...config };

                while (nextDate <= today) {
                    hasNewTransactions = true;
                    // إضافة العملية للسجل
                    newTxToAdd.push({
                        id: Date.now() + Math.random(),
                        type: config.type,
                        amount: config.amount,
                        category: config.category,
                        description: `(متكرر) ${config.description}`,
                        date: nextDate.toISOString().split('T')[0],
                        isRecurringInstance: true,
                        configId: config.id
                    });

                    // تحديث التاريخ القادم
                    if (config.recurring === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    else if (config.recurring === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    else if (config.recurring === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    else if (config.recurring === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

                    currentConfig.nextExecution = nextDate.toISOString();
                }
                return currentConfig;
            });

            if (hasNewTransactions) {
                setTransactions(prev => [...newTxToAdd, ...prev]);
                setRecurringConfigs(updatedConfigs);
                toast.success(`تم تسجيل ${newTxToAdd.length} عمليات متكررة مجدولة`, { icon: '🔄' });
            }
        };

        checkRecurring();
    }, [recurringConfigs]); // تشغيل عند تحميل التطبيق وعند تحديث الإعدادات

    // --- المنطق والعمليات الحسابية المشتقة ---
    const categorySpending = useMemo(() => {
        return Object.keys(CATEGORIES)
            .filter(cat => CATEGORIES[cat].type === 'expense')
            .map(cat => {
                const spent = transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0);
                return { id: cat, name: CATEGORIES[cat].name, icon: CATEGORIES[cat].icon, spent, budget: budgets[cat] || 0, color: CATEGORIES[cat].color };
            })
            .filter(item => item.spent > 0 || item.budget > 0);
    }, [transactions, budgets]);

    const stats = useMemo(() => {
        const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const balance = income - expense;

        const remainingBudgets = categorySpending.reduce((acc, item) => acc + Math.max(0, item.budget - item.spent), 0);
        const safeToSpend = balance - remainingBudgets;

        // حساب "تقريب الفكة" - Round-up Savings
        const roundUpSavings = transactions
            .filter(t => t.type === 'expense')
            .reduce((total, t) => {
                const roundedUp = Math.ceil(t.amount);
                const change = roundedUp - t.amount;
                return total + change;
            }, 0);

        // الرادار المالي - Financial Forecasting
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - currentDay;
        const dailyExpenseRate = currentDay > 0 ? expense / currentDay : 0;
        const projectedMonthlyExpense = dailyExpenseRate * daysInMonth;
        const forecastedBalance = income - projectedMonthlyExpense;

        // الفئات المعرضة للخطر (Budget Burnout Detection)
        const atRiskCategories = categorySpending
            .filter(cat => cat.budget > 0 && cat.spent > 0)
            .map(cat => {
                const dailySpendRate = cat.spent / currentDay;
                const daysUntilBurnout = dailySpendRate > 0 ? Math.floor((cat.budget - cat.spent) / dailySpendRate) : Infinity;
                return {
                    ...cat,
                    daysUntilBurnout,
                    isAtRisk: daysUntilBurnout <= daysRemaining && daysUntilBurnout >= 0
                };
            })
            .filter(cat => cat.isAtRisk)
            .sort((a, b) => a.daysUntilBurnout - b.daysUntilBurnout);

        return {
            income,
            expense,
            balance,
            safeToSpend,
            remainingBudgets,
            roundUpSavings,
            forecast: {
                dailyExpenseRate,
                projectedMonthlyExpense,
                forecastedBalance,
                daysRemaining,
                atRiskCategories
            }
        };
    }, [transactions, categorySpending]);

    const healthScore = useMemo(() => {
        if (stats.income === 0 && stats.expense === 0) return 100;
        if (stats.income === 0) return 0;
        let score = 100;
        const expenseRatio = stats.expense / stats.income;
        score -= expenseRatio * 80;
        if (goals.length > 0) {
            const avgProgress = goals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / goals.length;
            score += avgProgress * 20;
        }
        return Math.max(Math.min(Math.round(score), 100), 0);
    }, [stats, goals]);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            // بحث نصي
            const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                CATEGORIES[t.category]?.name.includes(searchQuery);

            // تصفية متقدمة
            const matchesType = filters.type === 'all' || t.type === filters.type;
            const matchesCategory = filters.category === 'all' || t.category === filters.category;
            const matchesMinAmount = !filters.minAmount || t.amount >= parseFloat(filters.minAmount);
            const matchesStartDate = !filters.startDate || new Date(t.date) >= new Date(filters.startDate);
            const matchesEndDate = !filters.endDate || new Date(t.date) <= new Date(filters.endDate);

            return matchesSearch && matchesType && matchesCategory && matchesMinAmount && matchesStartDate && matchesEndDate;
        });
    }, [transactions, searchQuery, filters]);

    const chartData = useMemo(() => {
        let balance = 0;
        return [...filteredTransactions]
            .sort((a, b) => {
                const dateDiff = new Date(a.date) - new Date(b.date);
                if (dateDiff !== 0) return dateDiff;
                return a.id - b.id; // ترتيب فرعي حسب وقت الإضافة لضمان الدقة
            })
            .map(t => {
                const amount = t.type === 'income' ? t.amount : -t.amount;
                balance += amount;
                return {
                    ...t,
                    val: balance,
                    displayAmount: t.amount,
                    categoryName: CATEGORIES[t.category]?.name
                };
            })
            .slice(-20);
    }, [filteredTransactions]);



    // --- الأفعال والوظائف ---
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
            const transactionId = Date.now();
            const transaction = { id: transactionId, ...newTransaction, amount };

            // إذا كانت العملية متكررة، نضيفها للإعدادات أيضاً
            if (newTransaction.recurring !== 'none') {
                const nextDate = new Date(newTransaction.date);
                if (newTransaction.recurring === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                else if (newTransaction.recurring === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                else if (newTransaction.recurring === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                else if (newTransaction.recurring === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);

                const config = {
                    id: transactionId,
                    ...newTransaction,
                    amount,
                    nextExecution: nextDate.toISOString()
                };
                setRecurringConfigs([...recurringConfigs, config]);
            }

            setTransactions([transaction, ...transactions]);
            toast.success('تمت الإضافة بنجاح');
        }

        setShowModal(false);
        resetForm();
    };

    const deleteTransaction = (id) => {
        toast((t) => (
            <span className="flex items-center gap-3 font-bold text-sm">
                هل أنت متأكد؟
                <button onClick={() => {
                    setTransactions(transactions.filter(tr => tr.id !== id));
                    setRecurringConfigs(recurringConfigs.filter(conf => conf.id !== id));
                    toast.dismiss(t.id);
                    toast.success('تم الحذف');
                }} className="bg-rose-500 text-white px-3 py-1 rounded-lg">حذف</button>
            </span>
        ));
    };

    const addGoal = () => {
        if (!newGoal.title || !newGoal.targetAmount) {
            toast.error('يرجى إكمال بيانات الهدف');
            return;
        }
        const goal = { ...newGoal, id: Date.now(), currentAmount: parseFloat(newGoal.currentAmount), targetAmount: parseFloat(newGoal.targetAmount) };
        setGoals([...goals, goal]);
        setShowGoalModal(false);
        setNewGoal({ title: '', targetAmount: '', currentAmount: '0' });
        toast.success('تمت إضافة حلم جديد! 🚀');
    };

    const deleteGoal = (id) => {
        setGoals(goals.filter(g => g.id !== id));
        toast.success('تم حذف الهدف');
    };

    const allocateToGoal = () => {
        const amount = parseFloat(allocateAmount);
        if (!amount || amount <= 0) return;
        if (amount > stats.balance) {
            toast.error('الرصيد غير كافٍ');
            return;
        }

        const updatedGoals = goals.map(g => {
            if (g.id === allocationGoal.id) {
                const newTotal = g.currentAmount + amount;
                if (newTotal >= g.targetAmount && g.currentAmount < g.targetAmount) triggerCelebration();
                return { ...g, currentAmount: newTotal };
            }
            return g;
        });

        setGoals(updatedGoals);
        const savingTx = {
            id: Date.now(),
            type: 'expense',
            amount: amount,
            category: 'other',
            description: `ادخار لـ: ${allocationGoal.title}`,
            date: new Date().toISOString().split('T')[0]
        };
        setTransactions([savingTx, ...transactions]);
        setAllocationGoal(null);
        setAllocateAmount('');
        toast.success('تم التحويل! 🎯');
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
            date: new Date().toISOString().split('T')[0],
            recurring: 'none'
        });
        setEditingId(null);
    };

    const handleEdit = (t) => {
        setNewTransaction({ ...t, amount: t.amount.toString() });
        setEditingId(t.id);
        setShowModal(true);
    };

    const clearAllData = () => {
        toast((t) => (
            <div className="flex flex-col gap-4 p-2">
                <div className="flex items-center gap-3 text-rose-600 font-bold">
                    <span>⚠️ حذف كلي للبيانات!</span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => {
                        setTransactions([]);
                        setBudgets({});
                        setGoals([]);
                        setRecurringConfigs([]);
                        localStorage.clear();
                        toast.dismiss(t.id);
                        setShowBudgetModal(false);
                        setTimeout(() => window.location.reload(), 500);
                    }} className="flex-1 bg-rose-600 text-white py-2 rounded-lg font-bold text-xs">تأكيد</button>
                    <button onClick={() => toast.dismiss(t.id)} className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg font-bold text-xs">تراجع</button>
                </div>
            </div>
        ));
    };

    return (
        <AppContext.Provider value={{
            transactions, budgets, goals, currency, setCurrency, theme, setTheme,
            showModal, setShowModal,
            showGoalModal, setShowGoalModal,
            showBudgetModal, setShowBudgetModal,
            searchQuery, setSearchQuery,
            editingId, setEditingId,
            newTransaction, setNewTransaction,
            newGoal, setNewGoal,
            allocationGoal, setAllocationGoal,
            allocateAmount, setAllocateAmount,
            stats, healthScore, filteredTransactions, chartData, categorySpending,
            saveTransaction, deleteTransaction, addGoal, deleteGoal, allocateToGoal,
            updateBudget, resetForm, handleEdit, clearAllData,
            filters, setFilters,
            showShortcuts, setShowShortcuts
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => useContext(AppContext);
