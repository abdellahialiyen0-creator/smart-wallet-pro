import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, X, Wallet, TrendingUp } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * نافذة تخصيص الرصيد - تتبع ثيم التطبيق المختار
 */
const AllocationModal = React.memo(() => {
    const {
        allocationGoal, setAllocationGoal, allocateAmount,
        setAllocateAmount, allocateToGoal, stats, currency, theme
    } = useApp();

    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    if (!allocationGoal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            {/* خلفية معتمة */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setAllocationGoal(null)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* محتوى النافذة */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="border rounded-2xl shadow-2xl w-full max-w-sm z-10 relative overflow-hidden transition-all duration-300"
                style={{
                    backgroundColor: 'var(--app-card)',
                    borderColor: 'var(--app-border)'
                }}
            >
                {/* زر الإغلاق */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={() => setAllocationGoal(null)}
                        className="p-2 transition-all rounded-lg opacity-60 hover:opacity-100"
                        style={{ color: 'var(--app-text)' }}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center">
                    {/* أيقونة التحويل */}
                    <div
                        className="p-5 rounded-2xl mb-6 flex items-center justify-center transition-colors duration-500"
                        style={{ backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)' }}
                    >
                        <TrendingUp className="w-10 h-10" style={{ color: 'var(--app-accent)' }} />
                    </div>

                    <h3 className="text-xl font-black mb-2 text-center" style={{ color: 'var(--app-text)' }}>توفير للهدف</h3>
                    <p
                        className="text-[11px] font-black text-center mb-8 px-4 leading-relaxed opacity-70"
                        style={{ color: 'var(--app-text)' }}
                    >
                        كم تود تخصيص مبلغ من رصيدك لـ <span className="font-black" style={{ color: 'var(--app-accent)' }}>"{allocationGoal.title}"</span>؟
                    </p>

                    <div className="w-full space-y-6">
                        {/* حقل القيمة */}
                        <div className="relative">
                            <DollarSign
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5"
                                style={{ color: 'var(--app-accent)', opacity: 0.5 }}
                            />
                            <input
                                type="number"
                                placeholder="0.00"
                                value={allocateAmount}
                                onChange={e => setAllocateAmount(e.target.value)}
                                className="w-full border px-12 py-5 rounded-xl font-black text-3xl outline-none transition-all text-center placeholder:opacity-20 shadow-inner"
                                style={{
                                    backgroundColor: isDark ? 'rgba(var(--app-bg-rgb, 15, 23, 42), 0.5)' : 'rgba(248, 250, 252, 0.4)',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>

                        {/* معلومات الرصيد المتاح */}
                        <div
                            className="flex items-center justify-between p-4 border rounded-xl transition-colors duration-500"
                            style={{
                                backgroundColor: isDark ? 'rgba(var(--app-bg-rgb, 15, 23, 42), 0.4)' : 'rgba(248, 250, 252, 0.2)',
                                borderColor: 'var(--app-border)'
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <Wallet className="w-4 h-4 opacity-50" style={{ color: 'var(--app-text)' }} />
                                <span className="text-[10px] font-black uppercase tracking-tight opacity-60" style={{ color: 'var(--app-text)' }}>رصيدك المتاح</span>
                            </div>
                            <span className="text-sm font-black text-emerald-500">{formatCurrency(stats.balance, currency)}</span>
                        </div>

                        {/* زر التأكيد */}
                        <button
                            onClick={allocateToGoal}
                            className="w-full py-4 text-white rounded-xl font-black text-sm shadow-xl active:scale-95 transition-all duration-500 group"
                            style={{
                                backgroundColor: 'var(--app-accent)',
                                boxShadow: '0 10px 20px -5px rgba(var(--app-accent-rgb, 59, 130, 246), 0.5)'
                            }}
                        >
                            <span className="flex items-center justify-center gap-2">
                                تأكيد الإيداع الآن
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

export default AllocationModal;
