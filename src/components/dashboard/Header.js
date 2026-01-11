import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Target, Settings, Plus, FileSpreadsheet, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { exportPDF, exportCSV } from '../../utils/export';
import { THEMES } from '../../constants/themes';

/**
 * مكون رأس الصفحة (Header)
 * تم تحديثه ليشمل أدوات التصدير الجديدة والتصميم الهندسي للأيقونات
 */
const Header = React.memo(() => {
    const {
        transactions,
        currency,
        setShowGoalModal,
        setShowBudgetModal,
        setShowModal,
        setShowShortcuts,
        theme,
        resetForm
    } = useApp();

    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    // Extract RGB from hex for transparency
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
    };

    const accentRGB = hexToRgb(currentTheme.accent);

    return (
        <header
            className="flex flex-col md:flex-row justify-between items-center gap-6 border p-4 md:p-6 rounded-2xl shadow-sm transition-all duration-500 overflow-hidden"
            style={{
                backgroundColor: 'var(--app-card)',
                borderColor: 'var(--app-border)',
                '--app-accent-rgb': accentRGB
            }}
        >
            {/* الشعار والهوية البصرية */}
            <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
                <motion.div
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="p-2.5 md:p-3.5 rounded-xl md:rounded-2xl shadow-xl transition-all duration-500 flex-shrink-0"
                    style={{
                        backgroundColor: 'var(--app-accent)',
                        boxShadow: `0 8px 16px -4px rgba(${accentRGB}, 0.4)`
                    }}
                >
                    <Wallet className="w-5 h-5 md:w-7 md:h-7 text-white" />
                </motion.div>
                <div className="text-right">
                    <h1 className="text-lg md:text-2xl font-black tracking-tight leading-none mb-1" style={{ color: 'var(--app-text)' }}>محفظتي الذكية</h1>
                    <p className="text-slate-400 text-[9px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: 'var(--app-accent)' }}></span>
                        الإصدار الاحترافي v2.0
                    </p>
                </div>
            </div>

            {/* أدوات التحكم والإجراءات */}
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5 md:gap-2.5">
                    {/* زر تصدير Excel */}
                    <button
                        onClick={() => exportCSV(transactions, currency)}
                        title="تصدير Excel / CSV"
                        className="p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all hover:scale-105 active:scale-95 group shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: 'var(--app-border)',
                            color: 'var(--app-muted)'
                        }}
                    >
                        <FileSpreadsheet className="w-4 h-4 md:w-5 md:h-5 group-hover:text-emerald-500 transition-colors" />
                    </button>

                    {/* زر تصدير PDF */}
                    <button
                        onClick={() => exportPDF(transactions, currency)}
                        title="تصدير تقرير PDF"
                        className="p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all hover:scale-105 active:scale-95 group shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: 'var(--app-border)',
                            color: 'var(--app-muted)'
                        }}
                    >
                        <FileText className="w-4 h-4 md:w-5 md:h-5 group-hover:text-rose-500 transition-colors" />
                    </button>

                    {/* زر الأهداف */}
                    <button
                        onClick={() => setShowGoalModal(true)}
                        title="أهداف الادخار"
                        className="p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all hover:scale-105 active:scale-95 group shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: 'var(--app-border)',
                            color: 'var(--app-muted)'
                        }}
                    >
                        <Target className="w-4 h-4 md:w-5 md:h-5 group-hover:text-blue-500 transition-colors" />
                    </button>

                    {/* زر الإعدادات */}
                    <button
                        onClick={() => setShowBudgetModal(true)}
                        title="الإعدادات والمظهر"
                        className="p-2.5 md:p-3 rounded-xl md:rounded-2xl border transition-all hover:scale-105 active:scale-95 group shadow-sm"
                        style={{
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                            borderColor: 'var(--app-border)',
                            color: 'var(--app-muted)'
                        }}
                    >
                        <Settings className="w-4 h-4 md:w-5 md:h-5 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                    </button>

                    {/* زر اختصارات لوحة المفاتيح المكتشف حديثاً */}
                    <div className="hidden lg:block relative group">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap font-black">
                            اضغط على [ ? ] للدليل
                        </div>
                        <button
                            onClick={() => setShowShortcuts(true)}
                            className="p-3 rounded-2xl border border-dashed flex items-center gap-2 cursor-help opacity-60 hover:opacity-100 hover:scale-105 active:scale-95 transition-all shadow-sm"
                            style={{
                                backgroundColor: isDark ? '#0f172a' : '#f8fafc',
                                borderColor: 'var(--app-border)'
                            }}
                        >
                            <span className="text-[10px] font-black text-slate-400">Keys</span>
                            <div className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-black">?</div>
                        </button>
                    </div>
                </div>

                {/* فاصل رأسي خفيف */}
                <div className="hidden md:block w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                {/* زر إضافة عملية جديدة */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="flex items-center justify-center gap-2 px-4 md:px-6 py-3 md:py-3.5 text-white font-black rounded-xl md:rounded-2xl shadow-lg transition-all text-xs md:text-sm uppercase tracking-wide w-full sm:w-auto"
                    style={{
                        backgroundColor: 'var(--app-accent)',
                        boxShadow: `0 8px 16px -4px rgba(${accentRGB}, 0.4)`
                    }}
                >
                    <Plus className="w-4 h-4 md:w-5 md:h-5" />
                    <span>عملية جديدة</span>
                </motion.button>
            </div>
        </header>
    );
});

export default Header;
