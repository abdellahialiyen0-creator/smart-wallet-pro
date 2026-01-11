import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, Target, Settings, X, Download, FileSpreadsheet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

import { exportCSV, exportPDF } from '../../utils/export';

/**
 * مكون الزر العائم (Floating Action Button)
 * تم تحديثه ليختفي عند ظهور الهيدر، وتعديل مكان النصوص التوضيحية لليمين
 */
const FloatingActions = React.memo(() => {
    const { setShowModal, setShowGoalModal, setShowBudgetModal, transactions, currency } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);


    // مراقبة التمرير لإظهار/إخفاء الزر
    useEffect(() => {
        const handleScroll = () => {
            // إذا كان التمرير أكثر من 150 بكسل، نظهر الزر العائم
            if (window.scrollY > 150) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
                setIsOpen(false); // إغلاق القائمة إذا اختفى الزر
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const actions = [
        {
            icon: Wallet,
            label: 'عملية جديدة',
            color: 'bg-emerald-500',
            onClick: () => { setShowModal(true); setIsOpen(false); },
            delay: 0.05
        },
        {
            icon: Target,
            label: 'هدف جديد',
            color: 'bg-blue-500',
            onClick: () => { setShowGoalModal(true); setIsOpen(false); },
            delay: 0.1
        },
        {
            icon: FileSpreadsheet,
            label: 'تصدير Excel',
            color: 'bg-green-600',
            onClick: () => { exportCSV(transactions, currency); setIsOpen(false); },
            delay: 0.15
        },
        {
            icon: Download,
            label: 'تصدير PDF',
            color: 'bg-rose-500',
            onClick: () => { exportPDF(transactions, currency); setIsOpen(false); },
            delay: 0.2
        },
        {
            icon: Settings,
            label: 'الإعدادات',
            color: 'bg-slate-500',
            onClick: () => { setShowBudgetModal(true); setIsOpen(false); },
            delay: 0.25
        },
    ];

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0, y: 20 }}
                    className="fixed bottom-8 left-8 z-[90] flex flex-col items-center"
                >
                    {/* خيارات الزر الإضافية */}
                    <AnimatePresence>
                        {isOpen && (
                            <div className="flex flex-col-reverse items-center gap-4 mb-5">
                                {actions.map((action, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20, scale: 0.5 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: -20, scale: 0.5 }}
                                        transition={{ delay: action.delay }}
                                        className="group relative flex items-center justify-center"
                                    >
                                        {/* التايتل يظهر الآن على اليمين */}
                                        <span className="absolute left-14 bg-slate-800 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap shadow-xl translate-x-2 group-hover:translate-x-0">
                                            {action.label}
                                        </span>
                                        <button
                                            onClick={action.onClick}
                                            className={`w-12 h-12 ${action.color} text-white rounded-2xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all outline-none`}
                                        >
                                            <action.icon className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </AnimatePresence>

                    {/* الزر الرئيسي */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden group outline-none"
                        style={{
                            backgroundColor: 'var(--app-accent)',
                            boxShadow: '0 20px 25px -5px rgba(var(--app-accent-rgb, 59, 130, 246), 0.4)'
                        }}
                    >
                        <AnimatePresence mode="wait">
                            {isOpen ? (
                                <motion.div
                                    key="close"
                                    initial={{ rotate: -90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: 90, opacity: 0 }}
                                >
                                    <X className="w-8 h-8 text-white" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="plus"
                                    initial={{ rotate: 90, opacity: 0 }}
                                    animate={{ rotate: 0, opacity: 1 }}
                                    exit={{ rotate: -90, opacity: 0 }}
                                >
                                    <Plus className="w-8 h-8 text-white" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!isOpen && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="absolute inset-0 bg-white rounded-full"
                            />
                        )}
                    </motion.button>
                </motion.div>
            )}
        </AnimatePresence>
    );
});

export default FloatingActions;
