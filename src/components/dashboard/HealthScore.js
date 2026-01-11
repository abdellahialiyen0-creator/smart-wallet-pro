import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Award, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Info, MousePointerClick, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { THEMES } from '../../constants/themes';

/**
 * مكون مؤشر الصحة المالية - تم تطويره ليكون "ذكياً" ويقدم مقارنة شهرية وتحليلات
 * تم تثبيت الارتفاع لمنع اهتزاز الواجهة، وإضافة أسهم توجيهية للتقليب
 */
const HealthScore = React.memo(() => {
    const { healthScore, transactions, theme } = useApp();
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;
    const [showComparison, setShowComparison] = useState(false);

    // حساب مقارنة الأداء مع الشهر السابق
    const performance = useMemo(() => {
        const now = new Date();
        const thisMonth = transactions.filter(t => {
            const d = new Date(t.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        });

        const lastMonth = transactions.filter(t => {
            const d = new Date(t.date);
            let targetMonth = now.getMonth() - 1;
            let targetYear = now.getFullYear();
            if (targetMonth < 0) {
                targetMonth = 11;
                targetYear--;
            }
            return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        const thisMonthExpense = thisMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
        const lastMonthExpense = lastMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

        let diff = 0;
        if (lastMonthExpense > 0) {
            diff = ((thisMonthExpense - lastMonthExpense) / lastMonthExpense) * 100;
        }

        return {
            diff: Math.abs(Math.round(diff)),
            isHigher: thisMonthExpense > lastMonthExpense,
            hasData: lastMonthExpense > 0
        };
    }, [transactions]);

    const healthData = useMemo(() => {
        if (healthScore >= 80) return {
            label: 'ممتاز',
            color: 'text-emerald-500',
            stroke: 'stroke-emerald-500',
            ic: Award,
            msg: 'أداء مالي مذهل! أنت تسيطر تماماً على ميزانيتك.',
            bg: 'bg-emerald-50/50',
            tip: 'نصيحة: ابحث عن فرص استثمارية لنمو رصيدك الفائض.'
        };
        if (healthScore >= 50) return {
            label: 'جيد',
            color: 'text-blue-500',
            stroke: 'stroke-blue-500',
            ic: CheckCircle2,
            msg: 'وضعك مستقر، ولكن هناك مساحة للتحسين في الادخار.',
            bg: 'bg-blue-50/50',
            tip: 'نصيحة: قل ل مصروف "الترفيه" بنسبة 10% لترفع تقييمك.'
        };
        return {
            label: 'ضعيف',
            color: 'text-rose-500',
            stroke: 'stroke-rose-500',
            ic: AlertTriangle,
            msg: 'تنبيه: مصروفاتك مرتفعة جداً مقارنة بدخلك المتاح.',
            bg: 'bg-rose-50/50',
            tip: 'نصيحة: راجع سجل العمليات وحاول إلغاء المصاريف غير الضرورية.'
        };
    }, [healthScore]);

    return (
        <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setShowComparison(!showComparison)}
            className="lg:col-span-1 bg-white border p-5 md:p-6 rounded-2xl shadow-sm relative overflow-hidden group transition-all duration-500 cursor-pointer flex flex-col min-h-[280px] md:h-[230px] select-none will-change-transform"
            style={{
                backgroundColor: 'var(--app-card)',
                borderColor: 'var(--app-border)'
            }}
        >
            {/* أسهم التقليب الجانبية - تظهر عند التحويم */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <ChevronLeft className="w-5 h-5 text-slate-300" />
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* العنوان والأيقونات الذكية */}
                <div className="flex items-center justify-between mb-4 md:mb-2">
                    <div className="flex items-center gap-2">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">مؤشر الصحة المالية</h3>
                        <span className="bg-rose-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full animate-pulse uppercase tracking-tighter">جديد</span>
                    </div>
                    <div className="flex gap-2 items-center">
                        {!showComparison && (
                            <motion.div
                                animate={{ x: [0, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="hidden md:flex items-center gap-1 text-[9px] font-black text-blue-500 bg-blue-50/50 px-2 py-0.5 rounded-lg"
                            >
                                <MousePointerClick className="w-2.5 h-2.5" />
                                <span>انقر للمقارنة</span>
                            </motion.div>
                        )}
                        <div className={`p-1.5 rounded-xl transition-colors ${showComparison ? 'bg-blue-50 text-blue-500' : 'text-slate-300 group-hover:text-blue-400'}`}>
                            <Activity className={`w-3.5 h-3.5 ${!showComparison ? 'animate-pulse' : ''}`} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 relative min-h-[160px]">
                    <AnimatePresence mode="wait">
                        {!showComparison ? (
                            <motion.div
                                key="score"
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 30 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex flex-col items-center justify-center py-2 absolute inset-0"
                            >
                                {/* مؤشر الصحة المالية - تصميم احترافي نظيف */}
                                <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-500">
                                    <svg className="w-full h-full transform -rotate-90 filter drop-shadow-lg">
                                        <circle
                                            cx="40" cy="40" r="34"
                                            className="md:hidden"
                                            stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="6" fill="transparent"
                                        />
                                        <circle
                                            cx="48" cy="48" r="40"
                                            className="hidden md:block"
                                            stroke={isDark ? '#1e293b' : '#f1f5f9'} strokeWidth="6" fill="transparent"
                                        />
                                        <motion.circle
                                            cx="40" cy="40" r="34"
                                            stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={213.6}
                                            initial={{ strokeDashoffset: 213.6 }}
                                            animate={{ strokeDashoffset: 213.6 - (213.6 * healthScore) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                            className={`md:hidden ${healthData.stroke}`}
                                        />
                                        <motion.circle
                                            cx="48" cy="48" r="40"
                                            stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={251.2}
                                            initial={{ strokeDashoffset: 251.2 }}
                                            animate={{ strokeDashoffset: 251.2 - (251.2 * healthScore) / 100 }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                            className={`hidden md:block ${healthData.stroke}`}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className={`text-xl md:text-2xl font-black tracking-tighter ${healthData.color}`}>{healthScore}</span>
                                        <span className="text-[7px] text-slate-400 font-black uppercase tracking-widest">مجموع النقاط</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black ${healthData.bg} ${healthData.color} mb-2 border border-current/10`}>
                                        <healthData.ic className="w-3 h-3" />
                                        {healthData.label}
                                    </span>
                                    <p className="text-[9px] text-slate-400 font-bold leading-normal max-w-[180px] mx-auto italic">
                                        "{healthData.msg}"
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="comparison"
                                initial={{ opacity: 0, x: 30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="flex flex-col justify-center absolute inset-0 space-y-2 md:space-y-3 px-1"
                            >
                                <div className="space-y-2.5 md:space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-500 flex items-center gap-2">
                                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> مقارنة الأداء الشهري
                                    </h4>

                                    {performance.hasData ? (
                                        <div className={`p-3 md:p-2.5 rounded-xl border ${performance.isHigher ? 'bg-rose-50/30 border-rose-100' : 'bg-emerald-50/30 border-emerald-100'}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[9px] font-bold text-slate-500">معدل الانفاق اليومي</span>
                                                <span className={`text-[10px] font-black flex items-center gap-1 ${performance.isHigher ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                    {performance.isHigher ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                                    {performance.diff}%
                                                </span>
                                            </div>
                                            <p className="text-[8px] text-slate-400 font-bold">
                                                {performance.isHigher
                                                    ? "صرفت أكثر من الشهر الماضي، انتبه!"
                                                    : "أحسنت! انفاقك أقل من الشهر الماضي."}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 md:p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-center">
                                            <Info className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">لا توجد بيانات للمقارنة</p>
                                        </div>
                                    )}

                                    <div className="p-3 md:p-2.5 rounded-xl border border-blue-50 bg-blue-50/20">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Award className="w-3 h-3 text-blue-500" />
                                            <span className="text-[9px] font-black text-blue-600 uppercase">نصيحة ذكية</span>
                                        </div>
                                        <p className="text-[8px] text-slate-500 font-bold leading-tight">
                                            {healthData.tip}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* مؤشر النقر وتغيير الحالة بصرياً */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center opacity-70 group-hover:opacity-100 transition-opacity z-10">
                <div className="flex gap-1.5 p-1 bg-slate-100/30 dark:bg-slate-800/30 rounded-full backdrop-blur-sm">
                    <motion.div
                        animate={{ scale: !showComparison ? 1.3 : 1, width: !showComparison ? 12 : 6 }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${!showComparison ? 'bg-blue-500' : 'bg-slate-300'}`}
                    ></motion.div>
                    <motion.div
                        animate={{ scale: showComparison ? 1.3 : 1, width: showComparison ? 12 : 6 }}
                        className={`h-1.5 rounded-full transition-all duration-300 ${showComparison ? 'bg-blue-500' : 'bg-slate-300'}`}
                    ></motion.div>
                </div>
            </div>
        </motion.div>
    );
});

export default HealthScore;
