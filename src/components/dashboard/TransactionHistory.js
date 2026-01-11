import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { List as ListIcon, Edit3, Trash2, Search, RefreshCcw, Filter, X, Calendar, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * مكون سجل العمليات - تم تحديثه ليدعم التصفية المتقدمة والبحث الذكي
 */
const TransactionHistory = React.memo(() => {
    const {
        filteredTransactions, searchQuery, setSearchQuery,
        currency, handleEdit, deleteTransaction, theme,
        filters, setFilters
    } = useApp();

    const [showFilters, setShowFilters] = useState(false);
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    // حساب عدد الفحوصات الفعالة لتنبيه المستخدم
    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.startDate) count++;
        if (filters.endDate) count++;
        if (filters.category !== 'all') count++;
        if (filters.minAmount) count++;
        if (filters.type !== 'all') count++;
        return count;
    }, [filters]);

    // تجميع العمليات حسب التاريخ
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

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden transition-colors duration-300 will-change-transform" style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}>
            {/* رأس المكون وشريط البحث */}
            <div className="flex flex-col">
                <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center gap-4" style={{ borderColor: 'var(--app-border)' }}>
                    <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                        <ListIcon className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                        سجل العمليات المالية
                    </h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="ابحث في العمليات..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full border rounded-xl px-10 py-2.5 text-xs font-bold outline-none transition-all"
                                style={{
                                    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="p-2.5 rounded-xl border relative transition-all active:scale-95"
                            style={{
                                backgroundColor: showFilters ? 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)' : (isDark ? '#0f172a' : '#f8fafc'),
                                borderColor: showFilters ? 'var(--app-accent)' : 'var(--app-border)',
                                color: showFilters ? 'var(--app-accent)' : 'var(--app-muted)'
                            }}
                        >
                            <Filter className="w-5 h-5" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -left-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                {/* لوحة التصفية المتقدمة */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-b"
                            style={{ backgroundColor: isDark ? currentTheme.itemBg : '#fcfcfd', borderColor: 'var(--app-border)' }}
                        >
                            <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* نوع العملية */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        نوع المعاملة
                                    </label>
                                    <select
                                        value={filters.type}
                                        onChange={e => setFilters({ ...filters, type: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border text-xs font-bold outline-none bg-transparent cursor-pointer"
                                        style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                                    >
                                        <option value="all" style={{ backgroundColor: 'var(--app-card)' }}>الكل</option>
                                        <option value="income" style={{ backgroundColor: 'var(--app-card)' }}>دخل فقط</option>
                                        <option value="expense" style={{ backgroundColor: 'var(--app-card)' }}>مصروفات فقط</option>
                                    </select>
                                </div>

                                {/* التاريخ من */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> من تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.startDate}
                                        onChange={e => setFilters({ ...filters, startDate: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border text-xs font-bold outline-none bg-transparent"
                                        style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                                    />
                                </div>

                                {/* التاريخ إلى */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <Calendar className="w-3 h-3" /> إلى تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        value={filters.endDate}
                                        onChange={e => setFilters({ ...filters, endDate: e.target.value })}
                                        className="w-full p-2.5 rounded-lg border text-xs font-bold outline-none bg-transparent"
                                        style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                                    />
                                </div>

                                {/* المبلغ الأدنى */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> المبلغ أكبر من
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={filters.minAmount}
                                            onChange={e => setFilters({ ...filters, minAmount: e.target.value })}
                                            className="w-full p-2.5 rounded-lg border text-xs font-bold outline-none bg-transparent"
                                            style={{ borderColor: 'var(--app-border)', color: 'var(--app-text)' }}
                                        />
                                        <button
                                            onClick={() => setFilters({ ...filters, startDate: '', endDate: '', category: 'all', minAmount: '', type: 'all' })}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 transition-colors"
                                            title="مسح كافة الفلاتر"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* قائمة العمليات */}
            <div className="px-6 pb-6 space-y-8 max-h-[600px] overflow-y-auto custom-scrollbar">
                {groupedTransactions.map(group => {
                    const today = new Date().toISOString().split('T')[0];
                    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                    let label = group.date;
                    if (group.date === today) label = 'اليوم';
                    else if (group.date === yesterday) label = 'أمس';

                    return (
                        <div key={group.date} className="space-y-4">
                            {/* فاصل التاريخ */}
                            <div className="flex items-center justify-between px-2 sticky top-0 py-2 z-10 backdrop-blur-sm" style={{ backgroundColor: 'rgba(var(--app-card-rgb, 255, 255, 255), 0.9)' }}>
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--app-accent)' }}></span>
                                    {label}
                                </h4>
                                <div className="flex gap-4 text-[10px] font-black">
                                    {group.totalIncome > 0 && <span className="text-emerald-500">+{formatCurrency(group.totalIncome, currency)}</span>}
                                    {group.totalExpense > 0 && <span className="text-rose-500">-{formatCurrency(group.totalExpense, currency)}</span>}
                                </div>
                            </div>

                            {/* العمليات الفردية */}
                            <div className="grid gap-2">
                                {group.items.map(t => (
                                    <motion.div
                                        key={t.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="group flex items-center justify-between p-3.5 border rounded-xl transition-all hover:shadow-md"
                                        style={{
                                            backgroundColor: currentTheme.itemBg,
                                            borderColor: 'var(--app-border)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 md:gap-4">
                                            {/* أيقونة الفئة */}
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center text-lg md:text-xl shadow-sm transition-transform group-hover:scale-110 flex-shrink-0"
                                                style={{
                                                    backgroundColor: isDark ? 'var(--app-card)' : '#fff',
                                                    borderColor: 'var(--app-border)',
                                                    borderWidth: '1px'
                                                }}>
                                                {CATEGORIES[t.category]?.icon || '💰'}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5 md:gap-2">
                                                    <h5 className="font-bold text-xs md:text-sm mb-0.5 truncate" style={{ color: 'var(--app-text)' }}>{t.description || CATEGORIES[t.category]?.name}</h5>
                                                    {((t.recurring && t.recurring !== 'none') || t.isRecurringInstance) && (
                                                        <RefreshCcw className="w-2.5 h-2.5 md:w-3 md:h-3 text-blue-500 animate-[spin_4s_linear_infinite]" title="عملية مجدولة" />
                                                    )}
                                                </div>
                                                <span
                                                    className="text-[9px] md:text-[10px] font-bold flex items-center gap-1 md:gap-1.5 uppercase tracking-wide opacity-80"
                                                    style={{ color: 'var(--app-muted)' }}
                                                >
                                                    {CATEGORIES[t.category]?.name}
                                                    {t.recurring && t.recurring !== 'none' && (
                                                        <span className="px-1 py-0.5 bg-blue-50 text-blue-600 rounded-md text-[7px] md:text-[8px] border border-blue-100 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800">
                                                            تكرار {t.recurring === 'monthly' ? 'شهري' : t.recurring === 'weekly' ? 'أسبوعي' : 'يومي'}
                                                        </span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 md:gap-5">
                                            <span className={`text-sm md:text-[15px] font-black whitespace-nowrap ${t.type === 'income' ? 'text-emerald-500' : ''}`} style={{ color: t.type === 'income' ? undefined : 'var(--app-text)' }}>
                                                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, currency)}
                                            </span>

                                            {/* أزرار التحكم - ظاهرة دائماً على الموبايل */}
                                            <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all md:translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    onClick={() => handleEdit(t)}
                                                    className="p-1.5 md:p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="تعديل"
                                                >
                                                    <Edit3 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteTransaction(t.id)}
                                                    className="p-1.5 md:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="حذف"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* حالة عدم وجود بيانات */}
                {groupedTransactions.length === 0 && (
                    <div className="text-center py-24 rounded-2xl border-2 border-dashed" style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: 'var(--app-border)' }}>
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50" style={{ backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }}>
                            <ListIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 font-bold text-sm">لا توجد عمليات تطابق بحثك</p>
                        <p className="text-slate-400 text-[11px] mt-1 italic">جرب تغيير الفلاتر أو البحث بكلمات مختلفة</p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default TransactionHistory;
