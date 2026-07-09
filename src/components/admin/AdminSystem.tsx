import React, { useState } from "react";
import { 
  Database, Download, Upload, Send, ShieldAlert, CheckCircle2, Loader2, Cpu, HardDrive
} from "lucide-react";

interface AdminSystemProps {
  allSubscribers: any[];
  allBooks: any[];
  allOrders: any[];
  onRefresh: () => void;
}

export function AdminSystem({ 
  allSubscribers, allBooks, allOrders, onRefresh 
}: AdminSystemProps) {
  // Newsletter State
  const [newsSubject, setNewsSubject] = useState("");
  const [newsContent, setNewsContent] = useState("");
  const [newsSending, setNewsSending] = useState(false);
  const [newsSuccess, setNewsSuccess] = useState<string | null>(null);

  // Backup & Restore State
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsSubject || !newsContent) return;
    setNewsSending(true);
    setNewsSuccess(null);

    try {
      const res = await fetch("/api/admin/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: newsSubject, content: newsContent })
      });
      const data = await res.json();
      if (data.status === "success") {
        setNewsSuccess(`تم إرسال النشرة البريدية بنجاح إلى ${allSubscribers.length} مشترك!`);
        setNewsSubject("");
        setNewsContent("");
      } else {
        setNewsSuccess("حدث خطأ أثناء المحاولة.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setNewsSending(false);
    }
  };

  // Triggering backend Backup download
  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    try {
      window.open("/api/admin/backup", "_blank");
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setBackupLoading(false), 2000);
    }
  };

  // RESTORE backup: reads uploaded JSON and posts to server
  const handleUploadRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreLoading(true);
    setRestoreSuccess(null);
    setRestoreError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.tables) {
          setRestoreError("ملف النسخة الاحتياطية غير متوافق أو لا يحتوي على الجداول الصحيحة.");
          setRestoreLoading(false);
          return;
        }

        const response = await fetch("/api/admin/restore", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ backup: json })
        });

        const data = await response.json();
        if (data.status === "success") {
          setRestoreSuccess("تمت استعادة قواعد البيانات بالكامل بنجاح 100%! تم تحديث جميع سجلات الكتب والعملاء والطلبيات.");
          onRefresh();
        } else {
          setRestoreError(data.message || "فشلت عملية استعادة البيانات.");
        }
      } catch (err: any) {
        setRestoreError("فشل قراءة الملف المرفوع. يرجى التأكد من اختيار ملف JSON صحيح.");
      } finally {
        setRestoreLoading(false);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 text-stone-800" dir="rtl">
      
      {/* Enterprise Backup & Restore Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Backup Panel */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Database className="text-brand-900" size={20} />
            <div>
              <h3 className="font-serif font-bold text-stone-850 text-sm">النسخ الاحتياطي وحفظ قواعد البيانات (Backup)</h3>
              <p className="text-[10px] text-stone-400">تصدير كامل بيانات الكتب، الطلبيات، العملاء والمدونة كملف JSON لضمان حماية المعلومات.</p>
            </div>
          </div>

          <p className="text-xs text-stone-600 leading-relaxed">
            يسمح لك نظام النسخ الاحتياطي بحفظ حالة موقعك بالكامل بشكل فوري. في حال حدوث أي خلل، يمكنك رفع هذا الملف واسترجاع جميع بيانات دار النشر الخاصة بك في ثانية واحدة.
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={handleDownloadBackup}
              disabled={backupLoading}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2.5 px-6 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {backupLoading ? <Loader2 size={12} className="animate-spin" /> : <Download size={14} />}
              <span>تنزيل نسخة احتياطية كاملة (.json)</span>
            </button>
            
            <button
              onClick={() => {
                const configData = {
                  appName: "دار المتنبي للنشر والتوزيع",
                  env: "Production",
                  features: ["manuscripts", "payments", "blog", "orders", "newsletter"],
                  currency: "DZD",
                  taxRate: 0.19
                };
                const blob = new Blob([JSON.stringify(configData, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `dar-al-motanabi-config-backup-${Date.now()}.json`;
                a.click();
              }}
              className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center gap-2 border border-stone-200 shadow-sm cursor-pointer"
            >
              <Download size={14} />
              <span>نسخ احتياطي لإعدادات الموقع</span>
            </button>
          </div>
        </div>

        {/* Restore Panel */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
            <Upload className="text-amber-600" size={20} />
            <div>
              <h3 className="font-serif font-bold text-stone-850 text-sm">استيراد واستعادة البيانات بقاعدة البيانات (Restore)</h3>
              <p className="text-[10px] text-stone-400">اختر ملف نسخة احتياطية تم تنزيله سابقاً لإعادة هيكلة وتنظيف الجداول واستعادة البيانات.</p>
            </div>
          </div>

          {restoreSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>{restoreSuccess}</span>
            </div>
          )}

          {restoreError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-bold flex items-center gap-1.5">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{restoreError}</span>
            </div>
          )}

          <p className="text-xs text-stone-600 leading-relaxed">
            <span className="font-bold text-red-600">تنبيه هام جداً:</span> عملية الاستعادة ستقوم بمسح قاعدة البيانات الحالية وتعويضها بالكامل بمحتويات ملف النسخة الاحتياطية المرفوع.
          </p>

          <div className="pt-2">
            <label className="relative border-2 border-dashed border-stone-300 hover:border-brand-900 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-stone-50 group">
              <input 
                type="file" 
                accept=".json"
                onChange={handleUploadRestore}
                disabled={restoreLoading}
                className="hidden" 
              />
              {restoreLoading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-brand-900" size={24} />
                  <span className="text-xs font-bold text-stone-600">جاري استيراد وتحديث جداول قاعدة البيانات...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Upload className="text-stone-400 group-hover:text-brand-900 mb-2" size={24} />
                  <span className="text-xs font-bold text-stone-700">اسحب ملف النسخة الاحتياطية أو انقر هنا لرفعه</span>
                  <span className="text-[9px] text-stone-400">الملفات المسموح بها: JSON فقط</span>
                </div>
              )}
            </label>
          </div>
        </div>

      </div>

      {/* Broadcast Newsletter Section */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-stone-100 pb-3">
          <Send className="text-brand-900" size={20} />
          <div>
            <h3 className="font-serif font-bold text-stone-850 text-sm">بث وإرسال النشرة البريدية (Newsletter Broadcasting)</h3>
            <p className="text-[10px] text-stone-400">أرسل رسالة إلكترونية دفعة واحدة لجميع مشتركي النشرة البريدية لتعريفهم بآخر الإصدارات.</p>
          </div>
        </div>

        {newsSuccess && (
          <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-bold">
            {newsSuccess}
          </div>
        )}

        <form onSubmit={handleSendNewsletter} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-stone-700">عنوان الرسالة البريدية <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              required
              value={newsSubject}
              onChange={(e) => setNewsSubject(e.target.value)}
              placeholder="مثال: خصم خاص 20% على ديوان المتنبي وإصدارات التاريخ الإسلامي..."
              className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-stone-700">محتوى البريد الإلكتروني <span className="text-red-500">*</span></label>
            <textarea 
              rows={4}
              required
              value={newsContent}
              onChange={(e) => setNewsContent(e.target.value)}
              placeholder="اكتب تفاصيل النشرة الإخبارية وعروض الخصومات هنا..."
              className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 leading-relaxed font-medium"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-[10px] text-stone-400 font-bold font-mono">
              سيتم إرسال الرسالة إلى: {allSubscribers.length} مشترك مسجل حالياً.
            </span>
            <button 
              type="submit" 
              disabled={newsSending}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-5 rounded flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {newsSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              <span>إرسال النشرة البريدية الآن</span>
            </button>
          </div>
        </form>
      </div>

      {/* Live Resource Load Simulation & Technical Diagnostics */}
      <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
        <h3 className="font-serif font-bold text-stone-850 text-xs border-b border-stone-100 pb-3">إحصائيات الموارد المباشرة للخادم والذاكرة</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600">
          
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-700 flex items-center gap-1">
                <Cpu size={14} className="text-brand-900" />
                استهلاك المعالج (CPU)
              </span>
              <span className="font-mono font-bold text-emerald-600">12%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: "12%" }} />
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-700 flex items-center gap-1">
                <HardDrive size={14} className="text-amber-600" />
                استهلاك الذاكرة (RAM)
              </span>
              <span className="font-mono font-bold text-amber-600">34% (174MB / 512MB)</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full rounded-full" style={{ width: "34%" }} />
            </div>
          </div>

          <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-stone-700">حجم جداول الداتا</span>
              <span className="font-mono font-bold text-stone-500">خفيف</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>الكتب: {allBooks.length} سجل</div>
              <div>الطلبيات: {allOrders.length} سجل</div>
              <div>المشتركون: {allSubscribers.length} مشترك</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
