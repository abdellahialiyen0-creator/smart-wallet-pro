import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { useApp, AppProvider } from './context/AppContext';
import { THEMES } from './constants/themes';

// المكونات الفرعية
import Header from './components/dashboard/Header';
import StatsOverview from './components/dashboard/StatsOverview';
import TransactionHistory from './components/dashboard/TransactionHistory';
import AnalyticalChart from './components/dashboard/AnalyticalChart';
import SavingsGoals from './components/dashboard/SavingsGoals';
import HealthScore from './components/dashboard/HealthScore';
import SpendingInsights from './components/dashboard/SpendingInsights';
import TransactionModal from './components/modals/TransactionModal';
import BudgetModal from './components/modals/BudgetModal';
import GoalModal from './components/modals/GoalModal';
import AllocationModal from './components/modals/AllocationModal';
import FloatingActions from './components/dashboard/FloatingActions';
import KeyboardLegend from './components/dashboard/KeyboardLegend';

/**
 * المكون الرئيسي لمحتوى التطبيق
 * يدعم الآن اختصارات لوحة المفاتيح للمحترفين
 */
function AppContent() {
  const {
    theme, setShowModal, setShowBudgetModal, setShowGoalModal,
    resetForm, showShortcuts, setShowShortcuts
  } = useApp();
  const currentTheme = THEMES[theme] || THEMES.corporate;

  useEffect(() => {
    document.title = "محفظتي الذكية | الإدارة المالية الاحترافية";

    // إعداد مستمع لاختصارات لوحة المفاتيح
    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();

      // لا تشغل الاختصارات إذا كان المستخدم يكتب في حقل إدخال
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        if (e.key === 'Escape') { e.target.blur(); }
        return;
      }

      switch (key) {
        case 'n':
          e.preventDefault();
          resetForm();
          setShowModal(true);
          break;
        case 's':
          e.preventDefault();
          setShowBudgetModal(true);
          break;
        case 'g':
          e.preventDefault();
          setShowGoalModal(true);
          break;
        case '?':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setShowModal, setShowBudgetModal, setShowGoalModal, resetForm, setShowShortcuts]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '59, 130, 246';
  };

  const isDark = currentTheme.isDark;

  return (
    <div
      className="min-h-screen transition-colors duration-500 font-sans rtl pb-20 md:pb-0 font-medium relative overflow-hidden"
      style={{
        backgroundColor: 'var(--app-bg)',
        color: 'var(--app-text)',
        '--app-bg': currentTheme.bg,
        '--app-card': currentTheme.card,
        '--app-accent': currentTheme.accent,
        '--app-accent-rgb': hexToRgb(currentTheme.accent),
        '--app-text': currentTheme.text,
        '--app-muted': currentTheme.muted,
        '--app-border': currentTheme.border
      }}
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* خلفية احترافية خفيفة وسريعة - Optimized Mesh Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.05] transition-all duration-1000"
          style={{
            background: `radial-gradient(circle at 10% 20%, var(--app-accent) 0%, transparent 40%),
                         radial-gradient(circle at 90% 80%, var(--app-accent) 0%, transparent 40%)`,
            filter: 'blur(100px)'
          }}
        />
        {isDark && (
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' /%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat',
              backgroundSize: '200px 200px'
            }}
          />
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        <Header />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <HealthScore />
          <StatsOverview />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <AnalyticalChart />
            <TransactionHistory />
          </div>

          <aside className="space-y-8">
            <SavingsGoals />
            <SpendingInsights />
          </aside>
        </div>
      </div>

      <FloatingActions />

      <AnimatePresence mode="wait">
        <TransactionModal />
        <BudgetModal />
        <GoalModal />
        <AllocationModal />
      </AnimatePresence>

      <KeyboardLegend
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        theme={theme}
      />

      <style>{`
        * { transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${isDark ? '#334155' : '#cbd5e1'}; border-radius: 10px; }
        .rtl { direction: rtl; }
        @media (max-width: 768px) {
          .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        }
        /* إجبار المكونات على استخدام متغيرات الثيم */
        .bg-white, .card-bg { background-color: var(--app-card) !important; border-color: var(--app-border) !important; }
        .text-slate-800, .text-slate-900 { color: var(--app-text) !important; }
        .text-slate-500, .text-slate-400 { color: var(--app-muted) !important; }
        .border-slate-100, .border-slate-200 { border-color: var(--app-border) !important; }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}