import React from 'react';
import { motion } from 'framer-motion';
import { Target, Award, PlusCircle, TrendingUp, X, Sparkles, MapPin, Flag, Trophy } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * مكون أهداف الادخار المطور - نظام المستويات والمحطات (Smart Milestones)
 */
const SavingsGoals = React.memo(() => {
    const { goals, currency, setAllocationGoal, deleteGoal, setShowGoalModal, theme } = useApp();
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    // محطات الإنجاز (Milestones)
    const MILESTONES = [
        { label: 'البداية', percent: 0, icon: MapPin, color: 'text-slate-400' },
        { label: 'الربع الأول', percent: 25, icon: Flag, color: 'text-blue-400' },
        { label: 'منتصف الطريق', percent: 50, icon: Sparkles, color: 'text-indigo-400' },
        { label: 'اللمسات الأخيرة', percent: 75, icon: TrendingUp, color: 'text-purple-400' },
        { label: 'النصر', percent: 100, icon: Trophy, color: 'text-emerald-500' },
    ];

    return (
        <div
            className="bg-white border p-6 md:p-8 rounded-2xl shadow-sm relative overflow-hidden transition-colors duration-300 will-change-transform"
            style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
        >
            {/* رأس المكون */}
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-black flex items-center gap-2" style={{ color: 'var(--app-text)' }}>
                    <Target className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                    أهداف الادخار الذكية
                </h3>
                {goals.length > 0 && (
                    <button
                        onClick={() => setShowGoalModal(true)}
                        className="p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                        style={{ backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)', color: 'var(--app-accent)' }}
                        title="إضافة هدف جديد"
                    >
                        <PlusCircle className="w-5 h-5" />
                    </button>
                )}
            </div>

            <div className="max-h-[500px] overflow-y-auto custom-scrollbar pr-1 space-y-8 relative z-10">
                {goals.map(g => {
                    const progress = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                    const isCompleted = progress >= 100;

                    // تحديد المحطة الحالية
                    const currentMilestone = [...MILESTONES].reverse().find(m => progress >= m.percent) || MILESTONES[0];

                    return (
                        <motion.div
                            key={g.id}
                            layout
                            className={`p-5 rounded-2xl border transition-all relative group ${isCompleted
                                ? 'bg-emerald-50/20 border-emerald-200/50'
                                : 'border-slate-100 hover:shadow-xl'
                                }`}
                            style={{
                                backgroundColor: isCompleted ? undefined : (isDark ? '#1e293b' : '#fcfcfd'),
                                borderColor: isCompleted ? undefined : 'var(--app-border)'
                            }}
                        >
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-black text-sm" style={{ color: 'var(--app-text)' }}>
                                            {g.title}
                                        </h4>
                                        {isCompleted && <Award className="w-4 h-4 text-emerald-500 animate-bounce" />}
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border border-current/10 ${currentMilestone.color} ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                        <currentMilestone.icon className="w-3 h-3" />
                                        {currentMilestone.label}
                                    </div>
                                </div>
                                <button
                                    onClick={() => deleteGoal(g.id)}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                    title="حذف الهدف"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* شريط التقدم المطور مع نقاط المحطات */}
                            <div className="relative mb-6 pt-2">
                                <div className={`h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full rounded-full relative"
                                        style={{ backgroundColor: isCompleted ? '#10b981' : 'var(--app-accent)' }}
                                    >
                                        {/* وهج لشريط التقدم */}
                                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                                    </motion.div>
                                </div>

                                {/* نقاط المحطات (Visual Milestones on Bar) */}
                                <div className="absolute top-0 left-0 w-full flex justify-between px-0.5">
                                    {MILESTONES.map((m, idx) => (
                                        <div
                                            key={idx}
                                            className={`w-1.5 h-1.5 rounded-full border-2 transition-all duration-700 ${progress >= m.percent ? 'bg-white border-white scale-110 shadow-sm' : 'bg-slate-300 border-transparent opacity-30'}`}
                                            title={m.label}
                                        ></div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] mb-5">
                                <span className={`font-black uppercase tracking-widest ${isCompleted ? 'text-emerald-500' : ''}`} style={{ color: isCompleted ? undefined : 'var(--app-accent)' }}>
                                    {isCompleted ? 'انتصار مستحق!' : `${progress.toFixed(0)}% مكتمل`}
                                </span>
                                <span className="font-black" style={{ color: 'var(--app-text)' }}>
                                    {formatCurrency(g.currentAmount, currency)} <span className="text-slate-400 opacity-60">/ {formatCurrency(g.targetAmount, currency)}</span>
                                </span>
                            </div>

                            {!isCompleted && (
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setAllocationGoal(g)}
                                    className="w-full py-3 bg-white border rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow-md"
                                    style={{
                                        backgroundColor: isDark ? '#0f172a' : '#fff',
                                        borderColor: isDark ? '#334155' : 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.3)',
                                        color: 'var(--app-accent)'
                                    }}
                                >
                                    <TrendingUp className="w-4 h-4" />
                                    تخصيص مبلغ من الميزانية
                                </motion.button>
                            )}
                        </motion.div>
                    );
                })}

                {/* حالة عدم وجود أهداف */}
                {goals.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-14 px-6 border-2 border-dashed rounded-2xl transition-all group cursor-pointer"
                        style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc', borderColor: 'var(--app-border)' }}
                        onClick={() => setShowGoalModal(true)}
                    >
                        <div
                            className="w-16 h-16 bg-white border rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl"
                            style={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderColor: 'var(--app-border)' }}
                        >
                            <Target className="w-8 h-8" style={{ color: 'var(--app-accent)' }} />
                        </div>
                        <h4 className="font-black text-sm mb-2" style={{ color: 'var(--app-text)' }}>خطط لمستقبلك المالي</h4>
                        <p className="text-[11px] text-slate-400 font-bold leading-relaxed px-4 opacity-70">لا توجد أحلام مسجلة حالياً. ابدأ بإضافة أول هدف مالي لك وسنساعدك في الوصول إليه.</p>
                    </motion.div>
                )}
            </div>

            {/* زينة مرئية في الخلفية */}
            <div className="absolute -top-16 -left-16 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-20" style={{ backgroundColor: 'var(--app-accent)' }}></div>
        </div>
    );
});

export default SavingsGoals;
