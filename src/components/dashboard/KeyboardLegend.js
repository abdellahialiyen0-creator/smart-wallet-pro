import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Search, Plus,
    Settings, Target, Keyboard
} from 'lucide-react';
import { THEMES } from '../../constants/themes';

/**
 * دليل اختصارات لوحة المفاتيح
 * ظهر كلوحة معلومات عند الضغط على مفاتيح معينة
 */
const KeyboardLegend = ({ isOpen, onClose, theme }) => {
    const currentTheme = THEMES[theme] || THEMES.corporate;
    const isDark = currentTheme.isDark;

    const shortcuts = [
        { key: 'N', label: 'إضافة عملية جديدة', icon: <Plus className="w-4 h-4" /> },
        { key: 'S', label: 'فتح الإعدادات والميزانية', icon: <Settings className="w-4 h-4" /> },
        { key: 'G', label: 'إضافة هدف ادخار جديد', icon: <Target className="w-4 h-4" /> },
        { key: 'F', label: 'تركيز البحث السريع', icon: <Search className="w-4 h-4" /> },
        { key: 'Esc', label: 'إغلاق أي نافذة مفتوحة', icon: <X className="w-4 h-4" /> },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto">
                    {/* خلفية معتمة */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* نافذة الاختصارات */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="w-full max-w-md p-6 rounded-3xl shadow-2xl z-10 border relative overflow-hidden transition-colors duration-500"
                        style={{
                            backgroundColor: currentTheme.card,
                            borderColor: isDark ? '#334155' : '#e2e8f0'
                        }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 transition-colors duration-500">
                                    <Keyboard className="w-5 h-5 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-black tracking-tight" style={{ color: currentTheme.text }}>مركز التحكم السريع</h3>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {shortcuts.map((s, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 group hover:border-blue-200 dark:hover:border-blue-900/50 transition-all"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-slate-400 group-hover:text-blue-500 transition-colors">
                                            {s.icon}
                                        </div>
                                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 transition-colors duration-500">{s.label}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span className="px-2.5 py-1 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-black shadow-sm transition-colors duration-500" style={{ color: currentTheme.text }}>
                                            {s.key}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                اختصر وقتك وتحكم بمحفظتك كالمحترفين
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default KeyboardLegend;
