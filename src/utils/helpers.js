import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants/currencies';

/**
 * تنسيق المبالغ المالية مع العملة وتحويلها بناءً على النوع المختار
 * @param {number} amount - المبلغ بالعملة الأساسية (MRU)
 * @param {string} currencyCode - رمز العملة المطلوب العرض بها
 * @returns {string} - المبلغ المنسق نصياً
 */
export const formatCurrency = (amount, currencyCode = DEFAULT_CURRENCY) => {
    const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];

    // تحويل المبلغ بناءً على سعر الصرف
    const convertedAmount = amount * currency.rate;

    return (
        convertedAmount.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: currencyCode === 'MRO' ? 0 : 2,
        }) + " " + currency.symbol
    );
};

/**
 * إطلاق احتفالية بصرية (Confetti) عند تحقيق الأهداف
 * تطلق قصاصات ملونة من جانبين مختلفين من الشاشة
 */
export const triggerCelebration = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    // توليد رقم عشوائي ضمن مدى محدد
    const randomInRange = (min, max) => {
        return Math.random() * (max - min) + min;
    };

    const interval = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // إطلاق من اليسار
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });

        // إطلاق من اليمين
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
    }, 250);

    // عرض تنبيه نجاح مخصص
    toast.success('مبرووووك! لقد حققت هدف الادخار بنجاح 🏆', {
        duration: 8000,
        icon: '🎉',
        style: {
            borderRadius: '12px',
            background: '#ffffff',
            color: '#1e293b',
            padding: '16px',
            fontWeight: 'bold',
            borderRight: '6px solid #10b981',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        },
    });
};
