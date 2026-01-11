/**
 * تصنيفات العمليات المالية - تشمل المصاريف والدخل
 * يتم تعريف كل فئة مع الاسم بالعربية، الاسم بالإنجليزية (للتقارير)، اللون والأيقونة المتوافقة
 */
export const CATEGORIES = {
    food: { name: 'طعام', nameEn: 'Food', color: '#f59e0b', icon: '🍔', type: 'expense' },
    transport: { name: 'مواصلات', nameEn: 'Transport', color: '#3b82f6', icon: '🚗', type: 'expense' },
    bills: { name: 'فواتير', nameEn: 'Bills', color: '#ef4444', icon: '📄', type: 'expense' },
    entertainment: { name: 'ترفيه', nameEn: 'Entertainment', color: '#8b5cf6', icon: '🎮', type: 'expense' },
    health: { name: 'صحة', nameEn: 'Health', color: '#10b981', icon: '💊', type: 'expense' },
    shopping: { name: 'تسوق', nameEn: 'Shopping', color: '#ec4899', icon: '🛍️', type: 'expense' },
    other: { name: 'أخرى', nameEn: 'Other', color: '#6b7280', icon: '📦', type: 'expense' },
    salary: { name: 'راتب', nameEn: 'Salary', color: '#059669', icon: '💰', type: 'income' },
    freelance: { name: 'فريلانس', nameEn: 'Freelance', color: '#0891b2', icon: '💻', type: 'income' },
    gift: { name: 'هدية', nameEn: 'Gift', color: '#d946ef', icon: '🎁', type: 'income' }
};
