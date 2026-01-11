import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { CATEGORIES } from '../constants/categories';

/**
 * تصدير سجل العمليات المالية إلى ملف PDF
 */
export const exportPDF = (transactions, currency) => {
    try {
        const doc = new jsPDF('p', 'pt', 'a4');

        doc.setFontSize(22);
        doc.setTextColor(15, 23, 42);
        doc.text('Smart Wallet Pro - Financial Report', 40, 50);

        doc.setFontSize(11);
        doc.setTextColor(100, 116, 139);
        doc.text(`Report Date: ${new Date().toLocaleString()}`, 40, 70);

        const isArabic = (text) => /[\u0600-\u06FF]/.test(text);

        const tableData = transactions.map((t) => {
            const cat = CATEGORIES[t.category] || CATEGORIES.other;
            const safeDescription = t.description && !isArabic(t.description) ? t.description : cat.nameEn;

            return [
                t.date,
                safeDescription,
                cat.nameEn,
                t.type.toUpperCase(),
                `${t.amount} ${currency}`,
            ];
        });

        autoTable(doc, {
            head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
            body: tableData,
            startY: 100,
            styles: { fontSize: 10, cellPadding: 8, halign: 'left', font: 'helvetica' },
            headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontSize: 11, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 100 }
        });

        const dateStr = new Date().toISOString().split('T')[0];
        doc.save(`SmartWallet_Report_${dateStr}.pdf`);
        toast.success('تم تصدير التقرير بنجاح بصيغة PDF');
    } catch (error) {
        console.error('Error generating PDF:', error);
        toast.error('حدث خطأ أثناء تصدير PDF');
    }
};

/**
 * تصدير سجل العمليات المالية إلى ملف CSV (متوافق مع Excel)
 */
export const exportCSV = (transactions, currency) => {
    try {
        // رؤوس الأعمدة
        const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Currency'];

        // تجهيز البيانات
        const rows = transactions.map(t => {
            const cat = CATEGORIES[t.category] || CATEGORIES.other;
            return [
                t.date,
                `"${(t.description || cat.nameEn).replace(/"/g, '""')}"`, // تهريب علامات الاقتباس
                cat.nameEn,
                t.type,
                t.amount,
                currency
            ];
        });

        // دمج الرؤوس مع الصفوف
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        // إنشاء ملف وتحميله
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `SmartWallet_Data_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success('تم تصدير البيانات بنجاح بصيغة CSV');
    } catch (error) {
        console.error('Error exporting CSV:', error);
        toast.error('حدث خطأ أثناء تصدير CSV');
    }
};
