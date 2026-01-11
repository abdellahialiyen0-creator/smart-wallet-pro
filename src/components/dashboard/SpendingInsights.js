import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart as PieIcon, Sparkles, AlertCircle, Lightbulb, Activity } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * مكون تحليلات الإنفاق المطور - يشمل نظام النصائح المالية الذكية (Smart Insights)
 */
const SpendingInsights = React.memo(() => {
    const { categorySpending, currency, theme, stats } = useApp();
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;
    const [activeTab, setActiveTab] = React.useState('stats'); // stats | forecast | savings

    // محرك النصائح الذكية
    const smartAdvice = useMemo(() => {
        const spentCategories = categorySpending.filter(c => c.spent > 0);
        if (spentCategories.length === 0) return null;

        // 1. البحث عن تجاوز الميزانية
        const overflowCategory = spentCategories.find(c => c.budget > 0 && c.spent > c.budget);
        if (overflowCategory) {
            return {
                type: 'warning',
                icon: AlertCircle,
                color: 'text-rose-500',
                bg: 'bg-rose-50/50',
                title: 'تنبيه تجاوز الميزانية',
                msg: `لقد تجاوزت ميزانية "${overflowCategory.name}" بنسبة ${(((overflowCategory.spent - overflowCategory.budget) / overflowCategory.budget) * 100).toFixed(0)}%. حاول تقليص نفقاتك هنا.`
            };
        }

        // 2. تحليل أكبر فئة صرف
        const biggest = [...spentCategories].sort((a, b) => b.spent - a.spent)[0];
        if (biggest && biggest.spent > (stats.income * 0.4) && stats.income > 0) {
            return {
                type: 'insight',
                icon: Lightbulb,
                color: 'text-amber-500',
                bg: 'bg-amber-50/50',
                title: 'ملاحظة على نمط الصرف',
                msg: `تمثل "${biggest.name}" أكثر من 40% من دخلك. هل فكرت في إيجاد بدائل أرخص لهذا القسم؟`
            };
        }

        // 3. نصيحة ادخار عامة
        const savingsRate = stats.income > 0 ? ((stats.income - stats.expense) / stats.income) * 100 : 0;
        if (savingsRate < 20 && stats.income > 0) {
            return {
                type: 'tip',
                icon: Sparkles,
                color: 'text-blue-500',
                bg: 'bg-blue-50/50',
                title: 'نصيحة للإدخار',
                msg: 'معدل ادخارك حالياً أقل من 20%. الالتزام بقاعدة 50/30/20 قد يساعدك في بناء أمان مالي أسرع.'
            };
        }

        return {
            type: 'positive',
            icon: Sparkles,
            color: 'text-emerald-500',
            bg: 'bg-emerald-50/50',
            title: 'أداء ممتاز',
            msg: 'أنت تلتزم بميزانيتك بشكل رائع هذا الشهر. استمر في هذا المسار الانضباطي!'
        };
    }, [categorySpending, stats]);

    return (
        <motion.div
            layout
            className="bg-white border p-4 md:p-8 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-300 min-h-[500px] md:min-h-[620px] will-change-transform"
            style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
            {/* رأس المكون والتبويبات */}
            <div className="flex flex-col items-center justify-center mb-6 md:mb-10 gap-4 md:gap-8">
                <div className="text-center">
                    <h3 className="text-xl md:text-2xl font-black flex items-center justify-center gap-2 mb-1" style={{ color: 'var(--app-text)' }}>
                        <PieIcon className="w-5 h-5 md:w-6 md:h-6 text-rose-500" />
                        تحليلات المحفظة
                    </h3>
                    <div className="h-1 w-8 bg-rose-500/20 rounded-full mx-auto mb-2 md:mb-3"></div>
                    <p className="text-[8px] md:text-[10px] text-slate-400 font-black uppercase tracking-widest md:tracking-[0.3em] opacity-60 px-4">نظرة شاملة على سلوكك المالي</p>
                </div>

                <div className="flex bg-slate-100/30 dark:bg-slate-800/60 p-1 md:p-1.5 rounded-xl md:rounded-[20px] items-center backdrop-blur-xl border border-white/10 dark:border-slate-700/50 w-full max-w-[450px] shadow-2xl relative">
                    {[
                        { id: 'stats', label: 'التوزيع', icon: PieIcon },
                        { id: 'forecast', label: 'الرادار', icon: Activity },
                        { id: 'savings', label: 'التوفير', icon: Sparkles }
                    ].map(tab => {
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2.5 px-1 md:px-2 py-2.5 md:py-3 rounded-lg md:rounded-[14px] text-[9px] md:text-[11px] font-black transition-all duration-500 relative z-10 ${isActive
                                    ? 'shadow-xl scale-105'
                                    : 'hover:bg-slate-200/40 dark:hover:bg-slate-700/40 opacity-60 hover:opacity-100'
                                    }`}
                                style={{
                                    backgroundColor: isActive ? 'var(--app-accent)' : 'transparent',
                                    color: isActive ? '#fff' : 'var(--app-text)',
                                    boxShadow: isActive ? '0 8px 20px -5px rgba(var(--app-accent-rgb, 59, 130, 246), 0.4)' : 'none'
                                }}
                            >
                                <tab.icon className={`w-3.5 h-3.5 md:w-4 md:h-4 transition-transform duration-500 ${isActive ? 'scale-110' : 'opacity-60'}`} />
                                <span className={isActive ? 'opacity-100 translate-x-0' : 'opacity-70 translate-x-0.5'}>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'stats' && (
                    <motion.div
                        key="stats"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >

                        {/* الرسم البياني الدائري - تصميم نظيف واحترافي */}
                        <div className="h-[260px] mb-8 relative group flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <defs>
                                        {/* تدرجات لونية لإعطاء عمق 3D لكل خلية */}
                                        {categorySpending.map((c, i) => (
                                            <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor={c.color} stopOpacity={1} />
                                                <stop offset="100%" stopColor={c.color} stopOpacity={0.7} />
                                            </linearGradient>
                                        ))}

                                        {/* تدرج للظل الداكن (الجوانب) */}
                                        <filter id="3dEffect" x="-20%" y="-20%" width="140%" height="140%">
                                            <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                                            <feOffset in="blur" dx="2" dy="4" result="offsetBlur" />
                                            <feSpecularLighting in="blur" surfaceScale="5" specularConstant=".75" specularExponent="20" lightingColor="#white" result="specOut">
                                                <fePointLight x="-5000" y="-10000" z="20000" />
                                            </feSpecularLighting>
                                            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
                                            <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="litPaint" />
                                            <feMerge>
                                                <feMergeNode in="offsetBlur" />
                                                <feMergeNode in="litPaint" />
                                            </feMerge>
                                        </filter>
                                    </defs>
                                    <Pie
                                        data={categorySpending}
                                        dataKey="spent"
                                        innerRadius={80}
                                        outerRadius={105}
                                        stroke={isDark ? 'var(--app-card)' : '#fff'}
                                        strokeWidth={3}
                                        paddingAngle={4}
                                        cornerRadius={8}
                                        animationBegin={0}
                                        animationDuration={1500}
                                    >
                                        {categorySpending.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                className="outline-none transition-all duration-300 hover:opacity-80 hover:scale-105 origin-center"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--app-card)',
                                            border: '1px solid var(--app-border)',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                            padding: '12px',
                                            color: 'var(--app-text)',
                                            backdropFilter: 'blur(12px)'
                                        }}
                                        itemStyle={{ fontSize: '11px', fontWeight: '900' }}
                                        cursor={{ fill: 'transparent' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* أيقونة مركزية محسّنة */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                                <div
                                    className="p-3 rounded-2xl backdrop-blur-md transition-all duration-300"
                                    style={{
                                        backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.1)',
                                        border: '1px solid rgba(var(--app-accent-rgb, 59, 130, 246), 0.2)'
                                    }}
                                >
                                    <PieIcon className="w-6 h-6" style={{ color: 'var(--app-accent)', opacity: 0.6 }} />
                                </div>
                            </div>
                        </div>

                        {/* قائمة الفئات وتتبع الميزانية */}
                        <div className="space-y-6">
                            {categorySpending.filter(c => c.spent > 0).slice(0, 5).map(c => {
                                const isExceeded = c.budget > 0 && c.spent > c.budget;
                                const progress = c.budget > 0 ? Math.min((c.spent / c.budget) * 100, 100) : 0;

                                return (
                                    <div key={c.id} className="group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="flex items-center gap-2 text-[10px] font-black" style={{ color: 'var(--app-text)' }}>
                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                                                <span>{c.icon}</span>
                                                <span className="opacity-80 uppercase tracking-tighter">{c.name}</span>
                                            </span>
                                            <span className={`text-[11px] font-black ${isExceeded ? 'text-rose-500' : ''}`} style={{ color: isExceeded ? undefined : 'var(--app-text)' }}>
                                                {formatCurrency(c.spent, currency)}
                                            </span>
                                        </div>

                                        {c.budget > 0 && (
                                            <div className="space-y-1">
                                                <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${progress}%` }}
                                                        className={`h-full rounded-full ${isExceeded ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 'bg-blue-400'}`}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                                    <span>الهدف: {formatCurrency(c.budget, currency)}</span>
                                                    <span className={isExceeded ? 'text-rose-400' : ''}>{progress.toFixed(0)}%</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'savings' && (
                    <motion.div
                        key="savings"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* بطاقة "تقريب الفكة للادخار" */}
                        {stats.roundUpSavings > 0 && (
                            <div
                                className="p-5 rounded-2xl border-2 border-dashed relative overflow-hidden group"
                                style={{
                                    borderColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.4)',
                                    background: isDark
                                        ? 'linear-gradient(135deg, rgba(var(--app-accent-rgb, 59, 130, 246), 0.1) 0%, rgba(var(--app-accent-rgb, 59, 130, 246), 0.05) 100%)'
                                        : 'linear-gradient(135deg, rgba(var(--app-accent-rgb, 59, 130, 246), 0.08) 0%, rgba(var(--app-accent-rgb, 59, 130, 246), 0.03) 100%)'
                                }}
                            >
                                <div className="relative z-10">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="p-2 rounded-xl"
                                                style={{
                                                    backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)'
                                                }}
                                            >
                                                <Sparkles className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--app-text)' }}>مدخرات الفكة التلقائية</h4>
                                                <p className="text-[9px] font-bold opacity-70" style={{ color: 'var(--app-accent)' }}>Round-up Savings</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mb-2">
                                        <div className="text-3xl font-black tracking-tight" style={{ color: 'var(--app-accent)' }}>
                                            {formatCurrency(stats.roundUpSavings, currency)}
                                        </div>
                                        <p className="text-[10px] font-bold mt-1 leading-relaxed opacity-70" style={{ color: 'var(--app-muted)' }}>
                                            هذا المبلغ تم ادخاره تلقائياً من خلال تقريب مصاريفك للعدد الصحيح التالي. 💸
                                        </p>
                                    </div>
                                </div>
                                {/* تأثير بصري خلفي */}
                                <div
                                    className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"
                                    style={{ backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.1)' }}
                                ></div>
                            </div>
                        )}

                        {/* قسم النصائح الذكية */}
                        {smartAdvice && (
                            <div
                                className={`p-4 rounded-2xl border border-current/10 ${smartAdvice.bg} relative overflow-hidden group`}
                                style={{ color: isDark ? '#fff' : undefined }}
                            >
                                <div className="flex gap-3 relative z-10">
                                    <div className={`p-2 rounded-xl bg-white/50 dark:bg-slate-800/50 ${smartAdvice.color}`}>
                                        <smartAdvice.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className={`text-[11px] font-black mb-1 ${smartAdvice.color}`}>{smartAdvice.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-relaxed italic">
                                            "{smartAdvice.msg}"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'forecast' && (
                    <motion.div
                        key="forecast"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* الرادار المالي - Financial Forecasting */}
                        {stats.forecast && stats.forecast.daysRemaining > 0 ? (
                            <div
                                className="p-6 rounded-2xl border relative overflow-hidden group"
                                style={{
                                    backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.08)',
                                    borderColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.3)'
                                }}
                            >
                                <div className="relative z-10">
                                    {/* العنوان */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div
                                            className="p-2.5 rounded-xl"
                                            style={{
                                                backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)'
                                            }}
                                        >
                                            <Activity className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black uppercase tracking-wide" style={{ color: 'var(--app-text)' }}>الرادار المالي</h4>
                                            <p className="text-[9px] font-bold opacity-70" style={{ color: 'var(--app-accent)' }}>Financial Forecasting</p>
                                        </div>
                                    </div>

                                    {/* التنبؤ بالرصيد */}
                                    <div className="grid grid-cols-1 gap-4 mb-4">
                                        <div className="p-4 rounded-xl border bg-white/50 dark:bg-slate-900/50" style={{ borderColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.2)' }}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">الرصيد المتوقع (نهاية الشهر)</p>
                                            <p className={`text-xl font-black ${stats.forecast.forecastedBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {formatCurrency(stats.forecast.forecastedBalance, currency)}
                                            </p>
                                        </div>
                                        <div className="p-4 rounded-xl border bg-white/50 dark:bg-slate-900/50" style={{ borderColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.2)' }}>
                                            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">صافي الصرف اليومي</p>
                                            <p className="text-xl font-black" style={{ color: 'var(--app-accent)' }}>
                                                {formatCurrency(stats.forecast.dailyExpenseRate, currency)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* الفئات المعرضة للخطر */}
                                    {stats.forecast.atRiskCategories && stats.forecast.atRiskCategories.length > 0 && (
                                        <div className="mt-4 p-4 rounded-xl border-2 border-dashed border-rose-300 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
                                            <div className="flex items-center gap-2 mb-3">
                                                <AlertCircle className="w-4 h-4 text-rose-500" />
                                                <h5 className="text-xs font-black text-rose-700 dark:text-rose-400 uppercase">ميزانيات في خطر</h5>
                                            </div>
                                            <div className="space-y-2">
                                                {stats.forecast.atRiskCategories.slice(0, 3).map((cat, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-2">
                                                            <span>{cat.icon}</span>
                                                            <span className="font-bold text-rose-600 dark:text-rose-400">{cat.name}</span>
                                                        </div>
                                                        <span className="font-black text-[10px] text-rose-500">
                                                            إغلاق في ~{cat.daysUntilBurnout} يوم
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="p-10 text-center opacity-50">
                                <Activity className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                <p className="text-xs font-black text-slate-400 uppercase">انتظر حتى تتوفر المزيد من البيانات للتنبؤ</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

export default SpendingInsights;
