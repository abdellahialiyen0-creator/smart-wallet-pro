import React from 'react';
import { motion } from 'framer-motion';
import { X, Target, Flag, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

/**
 * نافذة إضافة هدف ادخار جديد - تتبع ثيم التطبيق المختار
 */
const GoalModal = React.memo(() => {
    const { showGoalModal, setShowGoalModal, newGoal, setNewGoal, addGoal } = useApp();

    if (!showGoalModal) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[100] overflow-y-auto">
            {/* خلفية معتمة */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setShowGoalModal(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* محتوى النافذة */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white border rounded-2xl shadow-2xl w-full max-w-md z-10 relative overflow-hidden transition-colors duration-300"
                style={{ backgroundColor: 'var(--app-card)', borderColor: 'var(--app-border)' }}
            >
                {/* زر الإغلاق */}
                <div className="absolute top-4 right-4 z-20">
                    <button
                        onClick={() => setShowGoalModal(false)}
                        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 md:p-10 flex flex-col items-center">
                    {/* أيقونة الهدف */}
                    <div className="p-5 bg-indigo-50 rounded-2xl mb-6 relative transition-colors duration-500" style={{ backgroundColor: 'rgba(var(--app-accent-rgb, 59, 130, 246), 0.15)' }}>
                        <Target className="w-10 h-10" style={{ color: 'var(--app-accent)' }} />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    </div>

                    <h3 className="text-xl font-bold mb-2 text-center" style={{ color: 'var(--app-text)' }}>إضافة هدف ادخار</h3>
                    <p className="text-xs font-medium text-center mb-8 px-4 leading-relaxed" style={{ color: 'var(--app-muted)' }}>
                        حدد حلمك المالي والمبلغ المطلوب لتحقيقه. سنقوم بمتابعة تقدمك خطوة بخطوة.
                    </p>

                    <div className="w-full space-y-6">
                        {/* حقل اسم الهدف */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                                <Flag className="w-3.5 h-3.5" /> اسم الطموح
                            </label>
                            <input
                                placeholder="مثلاً: شراء سيارة، رحلة سياحية..."
                                value={newGoal.title}
                                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                                className="w-full border p-3.5 rounded-xl font-bold outline-none transition-all text-sm"
                                style={{
                                    backgroundColor: 'var(--app-input)',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>

                        {/* حقل المبلغ المستهدف */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold flex items-center gap-2 px-1" style={{ color: 'var(--app-muted)' }}>
                                <DollarSign className="w-3.5 h-3.5" /> المبلغ المطلوب توفيره
                            </label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={newGoal.targetAmount}
                                onChange={e => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                                className="w-full border p-4 rounded-xl font-bold text-2xl outline-none transition-all text-center"
                                style={{
                                    backgroundColor: 'var(--app-input)',
                                    borderColor: 'var(--app-border)',
                                    color: 'var(--app-text)'
                                }}
                            />
                        </div>

                        {/* زر البدء */}
                        <button
                            onClick={addGoal}
                            className="w-full py-4 text-white rounded-xl font-black text-sm shadow-lg active:scale-95 transition-all mt-4 duration-500"
                            style={{
                                backgroundColor: 'var(--app-accent)',
                                boxShadow: '0 10px 15px -3px rgba(var(--app-accent-rgb, 59, 130, 246), 0.4)'
                            }}
                        >
                            تثبيت الهدف والبدء الآن
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
});

export default GoalModal;
