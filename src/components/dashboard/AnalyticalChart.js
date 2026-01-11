import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, ArrowRight, Calendar } from 'lucide-react';
import {
    AreaChart, Area, XAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, YAxis
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../constants/categories';
import { formatCurrency } from '../../utils/helpers';
import { THEMES } from '../../constants/themes';

/**
 * مكون الرسم البياني التحليلي - تم تبسيطه ليكون بديهياً تماماً
 * النظام: الماضي (يسار) -> المستقبل/الحاضر (يمين)
 * تم إضافة تسميات واضحة للتواريخ لإزالة أي غموض
 */
const AnalyticalChart = React.memo(() => {
    const { chartData, currency, theme } = useApp();
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    const trend = useMemo(() => {
        if (chartData.length < 2) return { val: 0, isPos: true };
        const first = chartData[0].val;
        const last = chartData[chartData.length - 1].val;
        if (first === 0) return { val: last > 0 ? 100 : 0, isPos: last > 0 };
        const percent = ((last - first) / Math.abs(first)) * 100;
        return { val: Math.abs(percent).toFixed(1), isPos: percent >= 0 };
    }, [chartData]);

    return (
        <div
            className="bg-white border p-6 md:p-8 rounded-2xl shadow-sm relative group overflow-hidden transition-all duration-500 will-change-transform"
            style={{
                backgroundColor: 'var(--app-card)',
                borderColor: 'var(--app-border)'
            }}
        >
            {/* الخلفية التجميلية */}
            <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full -mr-24 -mt-24 blur-[100px] opacity-20 pointer-events-none"
                style={{ backgroundColor: 'var(--app-accent)' }}
            ></div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 relative z-10 gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="p-3 rounded-2xl border shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                            borderColor: 'var(--app-border)'
                        }}
                    >
                        <TrendingUp className="w-5 h-5" style={{ color: 'var(--app-accent)' }} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight" style={{ color: 'var(--app-text)' }}>تحليلات التدفق المالي</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1 opacity-70">مسار نمو أموالك عبر الزمن</p>
                    </div>
                </div>

                {/* مؤشر اتجاه الزمن والإحصائيات */}
                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">صافي الرصيد التحليلي</span>
                        <div className="flex items-center gap-2">
                            {chartData.length > 1 && (
                                <span className={`flex items-center text-[10px] font-black ${trend.isPos ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {trend.isPos ? '↑' : '↓'} %{trend.val}
                                </span>
                            )}
                            <span className="text-sm font-black" style={{ color: 'var(--app-text)' }}>
                                {formatCurrency(chartData.length > 0 ? chartData[chartData.length - 1].val : 0, currency)}
                            </span>
                        </div>
                    </div>

                    <div
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-all"
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: 'var(--app-border)'
                        }}
                    >
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">سهم الزمن</span>
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                            <ArrowRight className="w-4 h-4 text-emerald-500" />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* الحاوية المستجيبة للرسم البياني - مع إظهار تواريخ بسيطة لمحور X */}
            <div className="h-[340px] relative z-10" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorWave" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={currentTheme.accent} stopOpacity={isDark ? 0.35 : 0.45} />
                                <stop offset="50%" stopColor={currentTheme.accent} stopOpacity={isDark ? 0.1 : 0.15} />
                                <stop offset="95%" stopColor={currentTheme.accent} stopOpacity={0} />
                            </linearGradient>

                            {/* فلتر ظل خط المنحنى لإعطائه عمقاً وجمالية */}
                            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                                <feOffset dx="0" dy="8" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.4" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={isDark ? '#334155' : '#cbd5e1'}
                            vertical={true}
                            horizontal={true}
                            opacity={0.5}
                        />

                        {/* استخدام ID كمفتاح لضمان ظهور كل نقطة بشكل مستقل حتى لو تكرر التاريخ */}
                        <XAxis
                            dataKey="id"
                            tick={{ fontSize: 9, fontWeight: 800, fill: currentTheme.muted }}
                            tickFormatter={(val) => {
                                const item = chartData.find(d => d.id === val);
                                return item ? item.date.split('-').slice(1).reverse().join('/') : '';
                            }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />

                        <YAxis
                            tick={{ fontSize: 9, fontWeight: 700, fill: currentTheme.muted }}
                            tickFormatter={(val) => val > 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                            axisLine={false}
                            tickLine={false}
                            width={35}
                        />

                        <Tooltip
                            shared={false}
                            trigger="hover"
                            cursor={{ stroke: isDark ? '#475569' : currentTheme.accent, strokeWidth: 1, strokeDasharray: '3 3' }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div
                                            className="border p-4 rounded-2xl shadow-2xl min-w-[220px] rtl backdrop-blur-md"
                                            style={{
                                                backgroundColor: isDark ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                                borderColor: 'var(--app-border)'
                                            }}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500">
                                                    {data.date}
                                                </div>
                                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${data.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {data.type === 'income' ? 'دخل' : 'صرف'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className={`text-2xl font-black tracking-tighter ${data.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {data.type === 'income' ? '+' : '-'}{formatCurrency(data.displayAmount, currency)}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg">{CATEGORIES[data.category]?.icon}</span>
                                                    <p className="text-[11px] font-black text-slate-500 uppercase">{data.categoryName}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />

                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke={currentTheme.accent}
                            strokeWidth={5}
                            strokeLinecap="round"
                            fill="url(#colorWave)"
                            filter="url(#lineShadow)"
                            activeDot={{ r: 6, fill: currentTheme.accent, strokeWidth: 2, stroke: '#fff' }}
                            dot={false}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* التوضيح النهائي */}
            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500 shadow-sm" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">التدفق من الأقدم (يسار) إلى الأحدث (يمين)</span>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                        <span>نمو</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                        <span>تراجع</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default AnalyticalChart;
