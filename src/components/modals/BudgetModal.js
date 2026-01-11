import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Settings, AlertTriangle, Save, Trash2,
    Palette, Check, ShieldCheck, Database,
    Layout, Coins
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CATEGORIES } from '../../constants/categories';
import { THEMES } from '../../constants/themes';
import { CURRENCIES } from '../../constants/currencies';
import toast from 'react-hot-toast';

/**
 * نافذة الإعدادات والتحكم الاحترافية
 * تم إعادة التصميم لتشبه المواقع العالمية بواجهة عصرية ومنظمة
 */
const BudgetModal = React.memo(() => {
    const {
        showBudgetModal,
        setShowBudgetModal,
        budgets,
        updateBudget,
        clearAllData,
        theme,
        setTheme,
        currency,
        setCurrency
    } = useApp();

    const [activeTab, setActiveTab] = useState('appearance');
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    if (!showBudgetModal) return null;

    const tabs = [
        { id: 'appearance', name: 'المظهر والسمات', icon: <Palette className="w-4 h-4" /> },
        { id: 'currency', name: 'العملة المفضلة', icon: <Coins className="w-4 h-4" /> },
        { id: 'budgets', name: 'تخطيط الميزانية', icon: <Layout className="w-4 h-4" /> },
        { id: 'data', name: 'البيانات والأمان', icon: <ShieldCheck className="w-4 h-4" /> }
    ];

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            {/* خلفية معتمة بأسلوب زجاجي */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowBudgetModal(false)}
                className="fixed inset-0 bg-slate-900/40 backdrop-blur-md"
            />

            {/* محتوى النافذة الرئيسي */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white border rounded-[2.5rem] shadow-2xl w-full max-w-4xl z-10 relative overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[650px]"
                style={{
                    backgroundColor: 'var(--app-card)',
                    borderColor: 'var(--app-border)'
                }}
            >
                {/* الشريط الجانبي (Sidebar) */}
                <div
                    className="w-full md:w-64 border-l p-6 md:p-8 flex flex-col gap-8 transition-colors duration-500"
                    style={{
                        backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                        borderColor: 'var(--app-border)'
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20" style={{ backgroundColor: 'var(--app-accent)', boxShadow: '0 10px 20px -5px rgba(var(--app-accent-rgb, 59, 130, 246), 0.3)' }}>
                            <Settings className="w-5 h-5" />
                        </div>
                        <h3 className="font-black text-lg tracking-tight" style={{ color: 'var(--app-text)' }}>الإعدادات</h3>
                    </div>

                    <nav className="flex flex-col gap-2 flex-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-xs transition-all ${activeTab === tab.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                    : 'text-slate-400 hover:bg-white dark:hover:bg-slate-800'
                                    }`}
                                style={{
                                    backgroundColor: activeTab === tab.id ? 'var(--app-accent)' : 'transparent',
                                    color: activeTab === tab.id ? '#fff' : 'var(--app-muted)',
                                    boxShadow: activeTab === tab.id ? '0 10px 25px -5px rgba(var(--app-accent-rgb, 59, 130, 246), 0.3)' : 'none'
                                }}
                            >
                                {tab.icon}
                                <span>{tab.name}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => { setShowBudgetModal(false); toast.success('تم حفظ التغييرات'); }}
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all border border-blue-400/20"
                            style={{ backgroundColor: 'var(--app-accent)', boxShadow: '0 10px 15px -3px rgba(var(--app-accent-rgb, 59, 130, 246), 0.3)' }}
                        >
                            <Save className="w-4 h-4" />
                            <span>حفظ التغييرات</span>
                        </motion.button>

                        <button
                            onClick={() => setShowBudgetModal(false)}
                            className="w-full flex items-center justify-center gap-2 p-3 text-[10px] font-black text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl transition-all"
                        >
                            إلغاء وتراجع
                        </button>
                    </div>
                </div>

                {/* المحتوى المتغير حسب التبويب */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
                    {/* زر إغلاق في الزاوية العلوية اليسرى */}
                    <button
                        onClick={() => setShowBudgetModal(false)}
                        className="absolute top-6 left-6 p-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all z-20 group"
                    >
                        <X className="w-5 h-5 group-hover:rotate-90 transition-all duration-300" />
                    </button>

                    <AnimatePresence mode="wait">
                        {activeTab === 'appearance' && (
                            <motion.div
                                key="appearance"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h4 className="text-xl font-black mb-2" style={{ color: 'var(--app-text)' }}>مظهر التطبيق</h4>
                                    <p className="text-xs text-slate-400 font-bold">اختر الثيم الذي يناسب ذوقك من مجموعتنا الحصرية</p>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    {Object.values(THEMES).map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setTheme(t.id)}
                                            className={`group relative p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 overflow-hidden ${theme === t.id
                                                ? 'border-blue-600 bg-blue-50/10'
                                                : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                                                }`}
                                            style={{
                                                borderColor: theme === t.id ? 'var(--app-accent)' : 'var(--app-border)',
                                                backgroundColor: theme === t.id ? 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.1)' : 'transparent'
                                            }}
                                        >
                                            <div
                                                className="w-full h-16 rounded-2xl shadow-lg transition-transform group-hover:scale-105"
                                                style={{ background: t.preview }}
                                            ></div>
                                            <span className="text-[10px] font-black" style={{ color: 'var(--app-text)' }}>{t.name}</span>

                                            {theme === t.id && (
                                                <div className="absolute top-3 left-3 bg-blue-600 text-white rounded-full p-1 shadow-md" style={{ backgroundColor: 'var(--app-accent)' }}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'currency' && (
                            <motion.div
                                key="currency"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h4 className="text-xl font-black mb-2" style={{ color: 'var(--app-text)' }}>العملة المفضلة</h4>
                                    <p className="text-xs text-slate-400 font-bold mb-6">سيتم تحويل كافة المبالغ والميزانيات تلقائياً للعملة المختارة</p>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {Object.values(CURRENCIES).map((curr) => (
                                            <button
                                                key={curr.code}
                                                onClick={() => setCurrency(curr.code)}
                                                className={`p-4 rounded-2xl border-2 flex items-center justify-between transition-all ${currency === curr.code
                                                    ? 'border-emerald-500 bg-emerald-50/10'
                                                    : 'border-slate-100 hover:border-slate-300 dark:border-slate-800'
                                                    }`}
                                                style={{
                                                    borderColor: currency === curr.code ? '#10b981' : 'var(--app-border)',
                                                    backgroundColor: currency === curr.code ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                                                }}
                                            >
                                                <div className="flex flex-col items-start gap-1">
                                                    <span className="text-lg">{curr.flag}</span>
                                                    <span className="text-[10px] font-black" style={{ color: 'var(--app-text)' }}>{curr.name}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-sm font-black ${currency === curr.code ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {curr.symbol}
                                                    </span>
                                                    {currency === curr.code && (
                                                        <Check className="w-4 h-4 text-emerald-500 mt-1" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'budgets' && (
                            <motion.div
                                key="budgets"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h4 className="text-xl font-black mb-2" style={{ color: 'var(--app-text)' }}>تخطيط الميزانية الذكية</h4>
                                    <p className="text-xs text-slate-400 font-bold">حدد سقف المصاريف لكل فئة لتصلك تنبيهات عند الاقتراب من الرقم</p>
                                </div>

                                <div className="grid gap-3">
                                    {Object.keys(CATEGORIES).filter(cat => CATEGORIES[cat].type === 'expense').map(cat => (
                                        <div
                                            key={cat}
                                            className="flex items-center justify-between p-4 rounded-3xl border border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 hover:border-blue-200 transition-all group"
                                            style={{ borderColor: 'var(--app-border)' }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="text-2xl p-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 transition-transform group-hover:scale-110" style={{ borderColor: 'var(--app-border)' }}>
                                                    {CATEGORIES[cat].icon}
                                                </div>
                                                <span className="font-black text-xs" style={{ color: 'var(--app-text)' }}>{CATEGORIES[cat].name}</span>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={budgets[cat] || ''}
                                                    onChange={e => updateBudget(cat, e.target.value)}
                                                    placeholder="0"
                                                    className="w-32 border p-3 rounded-2xl text-center font-black text-xs focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
                                                    style={{
                                                        backgroundColor: 'var(--app-input)',
                                                        borderColor: 'var(--app-border)',
                                                        color: 'var(--app-text)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'data' && (
                            <motion.div
                                key="data"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-10"
                            >
                                <div>
                                    <h4 className="text-xl font-black mb-2" style={{ color: 'var(--app-text)' }}>البيانات والأمان</h4>
                                    <p className="text-xs text-slate-400 font-bold">تحكم في خصوصية بياناتك المخزنة محلياً على جهازك</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-6 rounded-[2rem] border border-blue-50 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-900/10" style={{ borderColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.2)', backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.05)' }}>
                                        <div className="flex items-center gap-3 mb-4 text-blue-600 dark:text-blue-400" style={{ color: 'var(--app-accent)' }}>
                                            <Database className="w-5 h-5" />
                                            <span className="font-black text-sm uppercase tracking-tight">النسخ الاحتياطي</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 leading-relaxed mb-4">يتم حفظ بياناتك تلقائياً في ذاكرة التصفح المحلية. لا تتردد في تصدير بياناتك دورياً كملف Excel.</p>
                                    </div>

                                    <div className="p-6 rounded-[2rem] border border-rose-100 dark:border-rose-900/30 bg-rose-50/30 dark:bg-rose-900/10">
                                        <div className="flex items-center gap-3 mb-4 text-rose-600 dark:text-rose-400">
                                            <AlertTriangle className="w-5 h-5" />
                                            <span className="font-black text-sm uppercase tracking-tight">منطقة الخطر</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-rose-600/70 leading-relaxed mb-6">عند القيام بمسح البيانات، سيتم حذف كافة العمليات والأهداف والميزانيات نهائياً ولا يمكن استعادتها.</p>
                                        <button
                                            onClick={clearAllData}
                                            className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-500/20 hover:bg-rose-700 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            إعادة ضبط المصنع والبدء من جديد
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>


                </div>
            </motion.div>
        </div>
    );
});

export default BudgetModal;
