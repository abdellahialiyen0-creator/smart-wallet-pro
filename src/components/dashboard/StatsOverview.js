import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Activity, PieChart, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * مكون ملخص الإحصائيات - تم تطويره ليكون أكثر "دسامة" وتوازناً بصرياً مع مؤشر الصحة المالية
 * أضفنا مؤشرات بصرية، وصفاً مختصراً، وإحصائيات فرعية لكل بطاقة
 */
const StatsOverview = React.memo(() => {
    const { stats, currency, theme, transactions } = useApp();
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    // حساب إحصائيات إضافية لملء البطاقات وضمان توازنها مع مؤشر الصحة
    const incomeCount = transactions.filter(t => t.type === 'income').length;
    const expenseCount = transactions.filter(t => t.type === 'expense').length;
    const savingsRate = stats.income > 0 ? Math.max(0, Math.round(((stats.income - stats.expense) / stats.income) * 100)) : 0;

    const items = [
        {
            label: 'إجمالي الدخل',
            val: stats.income,
            subtext: `${incomeCount} إيداعات مسجلة`,
            color: 'text-emerald-600',
            iconColor: 'text-emerald-500',
            bg: 'bg-emerald-50/50',
            barColor: 'bg-emerald-500',
            progress: stats.income > 0 ? 100 : 0,
            ic: TrendingUp,
            desc: 'مجموع التدفقات النقدية الواردة'
        },
        {
            label: 'إجمالي المصاريف',
            val: stats.expense,
            subtext: `${expenseCount} مصاريف مسجلة`,
            color: 'text-rose-600',
            iconColor: 'text-rose-500',
            bg: 'bg-rose-50/50',
            barColor: 'bg-rose-500',
            progress: stats.income > 0 ? Math.min((stats.expense / stats.income) * 100, 100) : 0,
            ic: TrendingDown,
            desc: 'مجموع ما تم إنفاقه من ميزانيتك'
        },
        {
            label: 'الرصيد المتاح',
            val: stats.balance,
            subtext: `نسبة الادخار: ${savingsRate}%`,
            accentColor: 'var(--app-accent)',
            progress: savingsRate,
            barColor: 'bg-blue-500',
            ic: Wallet,
            desc: 'المبلغ المتبقي المتاح للتصرف'
        },
        {
            label: 'الإنفاق الآمن اليوم',
            val: stats.safeToSpend,
            subtext: `بعد خصم الميزانيات المتبقية`,
            color: 'text-amber-600',
            iconColor: 'text-amber-500',
            bg: 'bg-amber-50/50',
            barColor: 'bg-amber-500',
            progress: stats.balance > 0 ? Math.max(0, Math.min((stats.safeToSpend / stats.balance) * 100, 100)) : 0,
            ic: ShieldCheck,
            desc: 'المبلغ الممكن صرفه دون قلق'
        }
    ];

    return (
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {items.map((s, i) => (
                <motion.div
                    key={i}
                    whileHover={{ scale: 1.02, y: -5 }}
                    className="bg-white border p-6 rounded-xl shadow-sm relative overflow-hidden group transition-all duration-500 flex flex-col justify-between h-full min-h-[230px] will-change-transform"
                    style={{
                        backgroundColor: 'var(--app-card)',
                        borderColor: 'var(--app-border)'
                    }}
                >
                    {/* زينة خلفية متحركة عند التحويم */}
                    <div
                        className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-all duration-700 group-hover:scale-150 opacity-[0.05] group-hover:opacity-10 pointer-events-none"
                        style={{ backgroundColor: s.accentColor || (s.color === 'text-emerald-600' ? '#10b981' : '#ef4444') }}
                    ></div>

                    <div className="relative z-10 flex flex-col h-full">
                        {/* الجزء العلوي: العنوان والتوصيف */}
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="p-2.5 rounded-xl border"
                                    style={{
                                        backgroundColor: isDark ? '#0f172a' : (s.bg || 'rgba(var(--app-accent-rgb), 0.1)'),
                                        borderColor: 'var(--app-border)'
                                    }}
                                >
                                    <s.ic className={`w-5 h-5 ${s.iconColor || ''}`} style={{ color: s.accentColor }} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{s.label}</p>
                                    <p className="text-[9px] text-slate-400 font-bold opacity-70 italic">{s.desc}</p>
                                </div>
                            </div>
                            <div className="p-1 px-2 bg-slate-50 border border-slate-100 rounded-md opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
                                <ArrowUpRight className="w-3 h-3 text-slate-400" />
                            </div>
                        </div>

                        {/* الجزء الأوسط: القيمة المالية الكبيرة */}
                        <div className="mt-auto mb-5">
                            <h2
                                className={`text-2xl font-black tracking-tight ${s.color || ''}`}
                                style={{ color: s.accentColor }}
                            >
                                {formatCurrency(s.val, currency)}
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <Activity className="w-3 h-3 text-slate-300" />
                                <span className={`text-[11px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{s.subtext}</span>
                            </div>
                        </div>

                        {/* الجزء السفلي: مؤشر مرئي لملء الفراغ البصري */}
                        <div className={`w-full h-1 rounded-full overflow-hidden mt-2 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${s.progress}%` }}
                                transition={{ duration: 1.2, ease: "easeOut" }}
                                className={`h-full rounded-full ${s.accentColor ? '' : s.barColor}`}
                                style={{ backgroundColor: s.accentColor }}
                            />
                        </div>
                    </div>

                    {/* أيقونة تقنية خافتة جداً في الخلفية لإضفاء مظهر احترافي */}
                    <PieChart className="absolute bottom-[-10px] left-[-10px] w-16 h-16 opacity-[0.02] -rotate-12 group-hover:rotate-0 transition-transform duration-1000" />
                </motion.div>
            ))}
        </div>
    );
});

export default StatsOverview;
