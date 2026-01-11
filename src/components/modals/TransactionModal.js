import React from 'react';
import { motion } from 'framer-motion';
import { X, TrendingDown, TrendingUp, DollarSign, Calendar, ChevronDown, AlignLeft, RefreshCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../constants/categories';


/**
 * نافذة إضافة/تعديل العملية المالية - تدعم الآن الجدولة التلقائية (العمليات المتكررة)
 */
const TransactionModal = React.memo(() => {
    const {
        showModal, setShowModal, editingId, newTransaction,
        setNewTransaction, saveTransaction
    } = useApp();

    if (!showModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            {/* خلفية معتمة */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowModal(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* محتوى النافذة */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-xl z-10 relative overflow-hidden transition-colors duration-300 max-h-[95vh] flex flex-col"
                style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
            >
                {/* الرأس */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0" style={{ backgroundColor: 'rgba(var(--app-card-rgb), 0.5)', borderColor: 'var(--app-border)' }}>
                    <h3 className="text-base md:text-lg font-bold" style={{ color: 'var(--app-text)' }}>
                        {editingId ? 'تعديل المعاملة المالية' : 'تسجيل معاملة جديدة'}
                    </h3>
                    <button
                        onClick={() => setShowModal(false)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        style={{ color: 'var(--app-muted)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5 md:p-8 space-y-5 md:space-y-6 overflow-y-auto custom-scrollbar">
                    {/* تبديل نوع العملية */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0" style={{ backgroundColor: 'var(--app-input)', borderColor: 'var(--app-border)' }}>
                        <button
                            onClick={() => setNewTransaction({ ...newTransaction, type: 'expense', category: 'food' })}
                            className={`flex-1 py-2 md:py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-sm ${newTransaction.type === 'expense'
                                ? 'bg-white shadow-sm'
                                : 'text-slate-500'
                                }`}
                            style={{
                                backgroundColor: newTransaction.type === 'expense' ? 'var(--app-card)' : 'transparent',
                                color: newTransaction.type === 'expense' ? '#ef4444' : 'var(--app-muted)'
                            }}
                        >
                            <TrendingDown className="w-4 h-4" /> مصروف
                        </button>
                        <button
                            onClick={() => setNewTransaction({ ...newTransaction, type: 'income', category: 'salary' })}
                            className={`flex-1 py-2 md:py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-xs md:text-sm ${newTransaction.type === 'income'
                                ? 'bg-white shadow-sm'
                                : 'text-slate-500'
                                }`}
                            style={{
                                backgroundColor: newTransaction.type === 'income' ? 'var(--app-card)' : 'transparent',
                                color: newTransaction.type === 'income' ? '#10b981' : 'var(--app-muted)'
                            }}
                        >
                            <TrendingUp className="w-4 h-4" /> دخل
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                        {/* حقل المبلغ */}
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                                <DollarSign className="w-3 md:w-3.5 h-3 md:h-3.5" /> المبلغ المالي
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newTransaction.amount}
                                onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
                                className="w-full border p-3 md:p-3.5 rounded-xl font-bold text-xl md:text-2xl outline-none transition-all"
                                style={{
                                    backgroundColor: 'var(--app-input)',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>

                        {/* حقل التصنيف */}
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                                <ChevronDown className="w-3 md:w-3.5 h-3 md:h-3.5" /> التصنيف
                            </label>
                            <div className="relative">
                                <select
                                    value={newTransaction.category}
                                    onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}
                                    className="w-full border p-3 md:p-3.5 rounded-xl font-bold outline-none text-xs md:text-sm appearance-none cursor-pointer transition-all"
                                    style={{
                                        backgroundColor: 'var(--app-input)',
                                        borderColor: 'var(--app-border)',
                                        color: 'var(--app-text)'
                                    }}
                                >
                                    {Object.keys(CATEGORIES).filter(cat => CATEGORIES[cat].type === newTransaction.type).map(cat => (
                                        <option key={cat} value={cat} style={{ backgroundColor: 'var(--app-card)' }}>{CATEGORIES[cat].icon} {CATEGORIES[cat].name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* حقل التكرار (Recurring) */}
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                            <RefreshCcw className="w-3 md:w-3.5 h-3 md:h-3.5" /> تكرار العملية (جدولة تلقائية)
                        </label>
                        <select
                            value={newTransaction.recurring}
                            onChange={e => setNewTransaction({ ...newTransaction, recurring: e.target.value })}
                            className="w-full border p-3 md:p-3.5 rounded-xl font-bold outline-none text-[11px] md:text-xs transition-all cursor-pointer"
                            style={{
                                backgroundColor: 'var(--app-input)',
                                borderColor: 'var(--app-border)',
                                color: 'var(--app-text)'
                            }}
                        >
                            <option value="none">بدون تكرار (عملية لمرة واحدة)</option>
                            <option value="daily">يومياً (تكرار كل يوم)</option>
                            <option value="weekly">أسبوعياً (تكرار كل أسبوع)</option>
                            <option value="monthly">شهرياً (مثلاً: راتب، إيجار، اشتراكات)</option>
                            <option value="yearly">سنوياً (مثلاً: رسوم سنوية)</option>
                        </select>
                    </div>

                    {/* حقل الوصف */}
                    <div className="space-y-1.5 md:space-y-2">
                        <label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                            <AlignLeft className="w-3 md:w-3.5 h-3 md:h-3.5" /> الوصف أو البيان
                        </label>
                        <input
                            type="text"
                            placeholder={newTransaction.type === 'income' ? "مثلاً: راتب يناير، علاوة..." : "مثلاً: مشتريات البقالة، فاتورة..."}
                            value={newTransaction.description}
                            onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })}
                            className="w-full border p-3 md:p-3.5 rounded-xl font-medium outline-none text-xs md:text-sm transition-all"
                            style={{
                                backgroundColor: 'var(--app-input)',
                                borderColor: 'var(--app-border)',
                                color: 'var(--app-text)'
                            }}
                        />
                    </div>

                    {/* حقل التاريخ وزر الحفظ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 pt-1 md:pt-2">
                        <div className="space-y-1.5 md:space-y-2">
                            <label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                                <Calendar className="w-3 md:w-3.5 h-3 md:h-3.5" /> تاريخ المعاملة
                            </label>
                            <input
                                type="date"
                                value={newTransaction.date}
                                onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })}
                                className="w-full border p-3 md:p-3.5 rounded-xl font-bold outline-none text-xs md:text-sm transition-all"
                                style={{
                                    backgroundColor: 'var(--app-input)',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={saveTransaction}
                                className="w-full py-3.5 md:py-4 text-white rounded-xl font-bold text-xs md:text-sm shadow-xl active:scale-[0.98] transition-all duration-500 mt-2 md:mt-0"
                                style={{
                                    backgroundColor: 'var(--app-accent)',
                                    boxShadow: '0 8px 16px -4px rgba(var(--app-accent-rgb, 59, 130, 246), 0.4)'
                                }}
                            >
                                {editingId ? 'تحديث البيانات' : 'حفظ وجدولة العملية'}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

export default TransactionModal;
