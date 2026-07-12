import html2pdf from "html2pdf.js";
import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, DollarSign, BookOpen, ScrollText, Mail, Users, 
  ShieldAlert, Loader2, RefreshCw, Handshake, Tag, Percent, Newspaper, Settings, X, Download, Printer
} from "lucide-react";

// Import modular sub-components
import { AdminOverview } from "../components/admin/AdminOverview";
import { AdminBooks } from "../components/admin/AdminBooks";
import { AdminOrders } from "../components/admin/AdminOrders";
import { AdminUsers } from "../components/admin/AdminUsers";
import { AdminCategoriesAuthors } from "../components/admin/AdminCategoriesAuthors";
import { AdminCouponsBlog } from "../components/admin/AdminCouponsBlog";
import { AdminSystem } from "../components/admin/AdminSystem";

interface AdminStats {
  counts: {
    books: number;
    orders: number;
    manuscripts: number;
    messages: number;
    subscribers: number;
  };
  financials: {
    totalSales: number;
  };
  recentOrders: any[];
  recentManuscripts: any[];
  recentMessages: any[];
}

export function Admin({ dbUser }: { dbUser?: any }) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "books" | "orders" | "manuscripts" | "users" | "categories_authors" | "coupons_offers" | "messages" | "subscribers" | "system"
  >("overview");

  // Databases States
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [allManuscripts, setAllManuscripts] = useState<any[]>([]);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const [allSubscribers, setAllSubscribers] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allAuthors, setAllAuthors] = useState<any[]>([]);
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  const [allBlogPosts, setAllBlogPosts] = useState<any[]>([]);
  const [selectedManuscript, setSelectedManuscript] = useState<any>(null);
  const [isEditingManuscript, setIsEditingManuscript] = useState(false);
  const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '' });
  const [isUpdatingManuscript, setIsUpdatingManuscript] = useState(false);

  const handleEditManuscriptClick = (sub: any) => {
    setSelectedManuscript(sub);
    setManuscriptForm({
      status: sub.status || 'submitted',
      retailPrice: sub.retailPrice || '', productionCostPerBook: sub.productionCostPerBook || ''
    });
    setIsEditingManuscript(false);
  };

  const handleSaveManuscript = async () => {
    if (!selectedManuscript) return;
    setIsUpdatingManuscript(true);
    try {
      const res = await fetch(`/api/manuscripts/${selectedManuscript.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: manuscriptForm.status,
          retailPrice: manuscriptForm.retailPrice,
          productionCostPerBook: manuscriptForm.productionCostPerBook
        })
      });
      if (res.ok) {
        await fetchAllAdminData();
        const updated = await res.json();
        setSelectedManuscript(updated.data || updated);
        setIsEditingManuscript(false);
      } else {
        alert("فشل تحديث المخطوط");
      }
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setIsUpdatingManuscript(false);
    }
  };

  const fetchAllAdminData = async () => {
    if (!dbUser || dbUser.role !== "admin") {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Fetch overview statistics
      const resStats = await fetch("/api/admin/stats");
      if (!resStats.ok) throw new Error("Failed to fetch admin stats");
      const dataStats = await resStats.json();
      setStats(dataStats.data || dataStats);

      // Pre-fetch all administration entities
      const [
        resOrders, resManuscripts, resMessages, resSubscribers, resBooks, 
        resUsers, resCategories, resAuthors, resCoupons, resBlog
      ] = await Promise.all([
        fetch("/api/orders").then(r => r.ok ? r.json() : []),
        fetch("/api/manuscripts").then(r => r.ok ? r.json() : []),
        fetch("/api/contact-messages").then(r => r.ok ? r.json() : []),
        fetch("/api/subscribers").then(r => r.ok ? r.json() : []),
        fetch("/api/books").then(r => r.ok ? r.json() : []),
        fetch("/api/admin/users").then(r => r.ok ? r.json() : []),
        fetch("/api/categories").then(r => r.ok ? r.json() : []),
        fetch("/api/authors").then(r => r.ok ? r.json() : []),
        fetch("/api/coupons").then(r => r.ok ? r.json() : []),
        fetch("/api/blog").then(r => r.ok ? r.json() : [])
      ]);

      setAllOrders(Array.isArray(resOrders) ? resOrders : (resOrders.data || []));
      setAllManuscripts(Array.isArray(resManuscripts) ? resManuscripts : (resManuscripts.data || []));
      setAllMessages(Array.isArray(resMessages) ? resMessages : (resMessages.data || []));
      setAllSubscribers(Array.isArray(resSubscribers) ? resSubscribers : (resSubscribers.data || []));
      setAllBooks(Array.isArray(resBooks) ? resBooks : (resBooks.data || []));
      setAllUsers(Array.isArray(resUsers) ? resUsers : (resUsers.data || []));
      setAllCategories(Array.isArray(resCategories) ? resCategories : (resCategories.data || []));
      setAllAuthors(Array.isArray(resAuthors) ? resAuthors : (resAuthors.data || []));
      setAllCoupons(Array.isArray(resCoupons) ? resCoupons : (resCoupons.data || []));
      setAllBlogPosts(Array.isArray(resBlog) ? resBlog : (resBlog.data || []));

    } catch (err: any) {
      console.error(err);
      setError("حدث خطأ أثناء تحميل بيانات لوحة التحكم من الخادم. يرجى التحقق من اتصال قاعدة البيانات وصلاحيات خادم الاستضافة.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAdminData();
  }, [dbUser]);

  if (!dbUser || dbUser.role !== "admin") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-stone-500" dir="rtl">
        <ShieldAlert className="text-red-500" size={60} />
        <h2 className="font-serif text-2xl font-bold text-stone-800">صلاحيات غير كافية</h2>
        <p className="max-w-md text-center">عذراً، هذه الصفحة مخصصة فقط لمديري النظام. الرجاء تسجيل الدخول بحساب المشرف.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-stone-500" dir="rtl">
        <Loader2 className="animate-spin text-brand-900" size={40} />
        <span className="font-serif text-lg">جاري جلب إحصائيات الخادم والموارد النشطة...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-4xl mx-auto my-16 p-8 bg-red-50 border border-red-200 rounded-lg text-center space-y-4" dir="rtl">
        <ShieldAlert className="text-red-600 mx-auto" size={48} />
        <h2 className="text-xl font-serif font-bold text-red-800">فشل في الاتصال بقاعدة البيانات والواجهة الخلفية</h2>
        <p className="text-sm text-red-600 leading-relaxed max-w-lg mx-auto">{error}</p>
        <button 
          onClick={fetchAllAdminData}
          className="bg-red-700 hover:bg-red-800 text-white font-bold py-2 px-6 rounded text-xs transition-colors flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>إعادة المحاولة والاتصال</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 text-stone-850" dir="rtl">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-stone-200 pb-6">
        <div>
          <span className="text-accent-gold font-bold text-xs tracking-widest block mb-1">لوحة التحكم والإشراف المتكاملة</span>
          <h1 className="text-3xl font-serif font-bold text-brand-900 flex items-center gap-2">
            <LayoutDashboard size={28} className="text-brand-900" />
            لوحة تحكم خادم دار المتنبي
          </h1>
        </div>
        <button 
          onClick={fetchAllAdminData}
          className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm border border-stone-200 cursor-pointer"
        >
          <RefreshCw size={14} />
          <span>تحديث البيانات المباشرة</span>
        </button>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex flex-wrap gap-2 mb-8 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
        {[
          { id: "overview", label: "نظرة عامة", icon: LayoutDashboard },
          { id: "books", label: `إدارة الكتب (${allBooks.length})`, icon: BookOpen },
          { id: "orders", label: `إدارة الطلبات (${allOrders.length})`, icon: DollarSign },
          { id: "users", label: `المستخدمون والمشرفون (${allUsers.length})`, icon: Users },
          { id: "categories_authors", label: "التصنيفات والمؤلفون", icon: Tag },
          { id: "coupons_offers", label: `الكوبونات والعروض (${allCoupons.length})`, icon: Percent },
          { id: "blog", label: `المدونة ومقالات المعرفة (${allBlogPosts.length})`, icon: Newspaper },
          { id: "manuscripts", label: `عقود النشر الموقعة (${allManuscripts.length})`, icon: Handshake },
          { id: "messages", label: `رسائل التواصل (${allMessages.length})`, icon: Mail },
          { id: "system", label: "الصيانة والنسخ الاحتياطي", icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-2 px-3 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                isActive 
                  ? "bg-brand-900 text-white shadow-md" 
                  : "text-stone-600 hover:bg-stone-200 hover:text-stone-800"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels Routing */}
      <div className="transition-all duration-300">
        
        {activeTab === "overview" && (
          <AdminOverview 
            stats={stats}
            allBooks={allBooks}
            allOrders={allOrders}
            allManuscripts={allManuscripts}
            allMessages={allMessages}
            allSubscribers={allSubscribers}
          />
        )}

        {activeTab === "books" && (
          <AdminBooks 
            allBooks={allBooks}
            allCategories={allCategories}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "orders" && (
          <AdminOrders 
            allOrders={allOrders}
            allBooks={allBooks}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "users" && (
          <AdminUsers 
            allUsers={allUsers}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "categories_authors" && (
          <AdminCategoriesAuthors 
            allCategories={allCategories}
            allAuthors={allAuthors}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "coupons_offers" && (
          <AdminCouponsBlog 
            allCoupons={allCoupons}
            allBlogPosts={allBlogPosts}
            allCategories={allCategories}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "blog" && (
          <AdminCouponsBlog 
            allCoupons={allCoupons}
            allBlogPosts={allBlogPosts}
            allCategories={allCategories}
            onRefresh={fetchAllAdminData}
          />
        )}

        {activeTab === "system" && (
          <AdminSystem 
            allSubscribers={allSubscribers}
            allBooks={allBooks}
            allOrders={allOrders}
            onRefresh={fetchAllAdminData}
          />
        )}

        {/* Existing Manuscripts Tab Content */}
        {activeTab === "manuscripts" && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
              <h2 className="font-serif font-bold text-brand-900 text-sm">المخطوطات ومذكرات النشر وعقود السعر التفاعلي المبرمة</h2>
            </div>
            <div className="p-6 overflow-x-auto">
              {allManuscripts.length === 0 ? (
                <div className="text-stone-400 text-center py-12 text-xs">لم يتم إرسال أو توقيع أي عقود نشر بعد.</div>
              ) : (
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                      <th className="p-3">المصنف وعنوانه</th>
                      <th className="p-3">المؤلف الموقّع</th>
                      <th className="p-3">التصنيف</th>
                      <th className="p-3">عدد الصفحات والنسخ</th>
                      <th className="p-3">تكلفة الطبع المقدرة</th>
                      <th className="p-3">سعر البيع وعائد الكاتب</th>
                      <th className="p-3 text-left pl-6">التوقيع الإلكتروني</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {allManuscripts.map((sub: any) => (
                      <tr key={sub.id} className="hover:bg-stone-50/50">
                        <td className="p-3">
                          <div className="font-bold text-brand-900 text-sm">{sub.bookTitle}</div>
                          <div className="text-stone-400 text-[10px] mt-0.5">الملف: {sub.uploadedFileName || "draft.pdf"}</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-700">{sub.authorName}</div>
                          <div className="text-stone-400 mt-0.5">الهاتف: {sub.phone}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-bold">{sub.bookCategory}</span>
                        </td>
                        <td className="p-3">
                          <div>{sub.pageCount} صفحة</div>
                          <div className="text-stone-400 mt-0.5">{sub.printCopies} نسخة</div>
                        </td>
                        <td className="p-3 font-mono font-bold text-stone-700">
                          {sub.totalPrintCost ? parseFloat(sub.totalPrintCost).toLocaleString() : "0"} د.ج
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-stone-800">السعر: {sub.retailPrice} د.ج</div>
                          <div className="text-accent-gold font-bold text-[10px] mt-0.5">أرباح الكاتب: {sub.royaltyPerSale} د.ج (10%)</div>
                        </td>
                        <td className="p-3 text-left pl-6 font-mono font-bold text-emerald-600">
                          "{sub.signatureName || "موقّع"}"
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleEditManuscriptClick(sub)}
                            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded text-xs font-bold transition-colors"
                          >
                            عرض التفاصيل
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Manuscript Details Modal */}
        {selectedManuscript && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg">تفاصيل المخطوط وعقد النشر</h3>
                <button onClick={() => setSelectedManuscript(null)} className="text-white hover:text-stone-300">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <h4 className="font-bold text-brand-900 mb-3 border-b border-stone-200 pb-2">معلومات المؤلف</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-stone-500 w-24 inline-block">الاسم الكامل:</span> <span className="font-bold">{selectedManuscript.authorName}</span></p>
                      <p><span className="text-stone-500 w-24 inline-block">البريد:</span> <span className="font-mono">{selectedManuscript.email}</span></p>
                      <p><span className="text-stone-500 w-24 inline-block">الهاتف:</span> <span className="font-mono">{selectedManuscript.phone}</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
                    <h4 className="font-bold text-brand-900 mb-3 border-b border-stone-200 pb-2">معلومات المخطوط</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-stone-500 w-24 inline-block">عنوان الكتاب:</span> <span className="font-bold">{selectedManuscript.bookTitle}</span></p>
                      <p><span className="text-stone-500 w-24 inline-block">التصنيف:</span> <span>{selectedManuscript.bookCategory}</span></p>
                      <p><span className="text-stone-500 w-24 inline-block">الصفحات:</span> <span>{selectedManuscript.pageCount} صفحة</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-2">الملخص والمحتوى</h4>
                  <p className="text-sm text-blue-800 leading-relaxed whitespace-pre-line">{selectedManuscript.summary}</p>
                </div>

                <div className="border border-stone-200 rounded-lg overflow-hidden print:hidden">
                  <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 font-bold text-stone-700">التفاصيل المالية وعقد النشر</div>
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-stone-500 text-xs mb-1">نوع الغلاف</p>
                      <p className="font-bold">{selectedManuscript.coverType === 'hardcover' ? 'مجلد فني' : 'ورقي'}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">عدد النسخ</p>
                      <p className="font-bold">{selectedManuscript.printCopies}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">تكلفة النسخة</p>
                      <p className="font-bold font-mono">{selectedManuscript.productionCostPerBook} د.ج</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">سعر البيع المقترح</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.retailPrice} د.ج</p>
                    </div>
                  </div>
                  {isEditingManuscript ? (
                    <div className="p-4 bg-stone-100 border-t border-stone-200">
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">حالة المخطوط</label>
                          <select 
                            value={manuscriptForm.status}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, status: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          >
                            <option value="submitted">تم الإيداع (قيد المراجعة)</option>
                            <option value="accepted">مقبول (في انتظار الدفع)</option>
                            <option value="contract_signed">تم توقيع العقد</option>
                            <option value="in_review">قيد التحرير والمراجعة</option>
                            <option value="printed">جاهز / مطبوع</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">تكلفة الإنتاج (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.productionCostPerBook}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, productionCostPerBook: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="مثال: 500"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">سعر البيع النهائي (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.retailPrice}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, retailPrice: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="مثال: 1200"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={handleSaveManuscript}
                            disabled={isUpdatingManuscript}
                            className="bg-brand-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-850 disabled:opacity-50"
                          >
                            {isUpdatingManuscript ? "جاري الحفظ..." : "حفظ التعديلات"}
                          </button>
                          <button 
                            onClick={() => setIsEditingManuscript(false)}
                            className="bg-stone-300 text-stone-700 px-4 py-2 rounded text-sm font-bold hover:bg-stone-400"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center">
                      <div className="text-sm">
                        <p className="text-stone-600 mb-1">حالة المخطوط: <strong className="text-brand-900">
                          {selectedManuscript.status === 'submitted' ? 'تم الإيداع (قيد المراجعة)' : 
                           selectedManuscript.status === 'accepted' ? 'مقبول (في انتظار الدفع)' :
                           selectedManuscript.status === 'contract_signed' ? 'تم توقيع العقد' :
                           selectedManuscript.status === 'in_review' ? 'قيد التحرير والمراجعة' :
                           selectedManuscript.status === 'printed' ? 'جاهز / مطبوع' : selectedManuscript.status}
                        </strong></p>
                        <p className="text-stone-600 mb-1">تم توقيع العقد إلكترونياً من قبل: <strong className="text-brand-900">"{selectedManuscript.signatureName}"</strong></p>
                        <p className="text-xs text-stone-500">تاريخ الطلب: {new Date(selectedManuscript.createdAt).toLocaleString('ar-EG')}</p>
                      </div>
                      <button 
                        onClick={() => setIsEditingManuscript(true)}
                        className="bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 px-4 py-2 rounded text-sm font-bold transition-colors"
                      >
                        تعديل الحالة وسعر البيع
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div id="contract-print-area" className="hidden print:block text-black text-sm text-justify pt-8 pb-12 w-full max-w-4xl mx-auto bg-white absolute inset-0 z-50 p-8" dir="rtl">
                <div className="text-center mb-8">
                  <h4 className="font-bold text-3xl font-serif mb-2">عقد نشر كتاب</h4>
                </div>

                <p className="mb-4"><strong>الطرف الأول (الناشر):</strong> دار المتنبي للطباعة والنشر ممثلة بالمدير: السيد نصر خشاب الكائن مقرها بالمخطط الخصوصي للتعاونية العقارية القطعة رقم 14 الشيخ المقراني ولاية المسيلة/ الجزائر.</p>
                <p className="mb-6"><strong>الطرف الثاني (المؤلف):</strong> السيد(ة): {selectedManuscript.authorName || "________________"} من جنسية جزائرية.</p>
                
                <p className="font-bold mb-2 text-center font-serif text-xl">مقدمة</p>
                <p className="mb-2">تقوم دار المتنبي للطباعة والنشر بأعمال نشر الكتب وطباعتها.</p>
                <p className="mb-2">يملك الطرف الثاني السيد (ة): {selectedManuscript.authorName || "________________"} كتاب بعنوان: "{selectedManuscript.bookTitle || "________________"}"</p>
                <p className="mb-6">ويرغب بالتعامل مع دار المتنبي للطباعة والنشر لنشر وطباعة هذا الكتاب وقد وافق على ذلك.</p>

                <p className="mb-4"><strong>البند الأول:</strong> تعتبر المقدمة أعلاه وجميع الملاحق إن وجدت جزءا لا يتجزأ من هذا العقد.</p>
                
                <p className="mb-6"><strong>البند الثاني:</strong> يمنح للناشر بصورة حصرية طوال مدة العقد حقوق طبع الكتاب ونشره.</p>
                
                <p className="font-bold mb-2 text-lg">البند الثالث: التزامات الناشر</p>
                <p className="mb-2">يتعهد ويلتزم الناشر بالقيام بما يلي:</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- طباعة الكتاب وفقا للنسخة المسلمة له من طرف المؤلف وبالجودة التي تضمن رضا القراء.</li>
                  <li>2- تقوم دار المتنبي للطباعة والنشر بإصدار {selectedManuscript.printCopies || 0} نسخة من الكتاب كطبعة أولى قابلة للتمديد يتحمل المؤلف تكاليف طبعها.</li>
                  <li>3- تلتزم الدار بـ:</li>
                  <ul className="list-disc pr-8 space-y-1 mb-2">
                    <li>تنسيق الكتاب.</li>
                    <li>تصميم الغلاف.</li>
                    <li>طباعة الكتاب.</li>
                    <li>تخزين الكتاب.</li>
                    <li>التوزيع والتسويق والتنسيق مع وسائل الاعلام والمؤسسات الثقافية.</li>
                    <li>المشاركة بالكتاب في المعارض الوطنية والدولية.</li>
                  </ul>
                  <li>4- يقوم الناشر بجميع التصاريح القانونية اللازمة تجاه الإيداع القانوني.</li>
                  <li>5- يحق للناشر تحديد ثمن بيع الكتاب دون الرجوع للمؤلف على أن يحفظ للمؤلف حقوقه المادية.</li>
                  <li>6- يستلم المؤلف عدد 20 نسخة من الكتاب.</li>
                  <li>7- تسديد نسبة فائدة المؤلف وفقا للبند الخامس من هذا العقد.</li>
                  <li>8- يحق للناشر ترجمة الكتاب ونشره كليا أو جزئيا في أي لغة أخرى بعد أخذ الموافقة الخطية من المؤلف وخلال مدة العقد.</li>
                  <li>- لا يحق للناشر بعد انتهاء مدة العقد إعادة نشر الكتاب مجددا أو أي جزء منه بأي شكل من الأشكال وتحت أي عنوان كان في الجزائر أو خارجها دون الموافقة الخطية للمؤلف.</li>
                  <li>9- يقدم الناشر للمؤلف التصميم النهائي للكتاب وعلى المؤلف إرسال الموافقة الخطية للناشر في غضون أسبوع من الاستلام، وإن لم يتم إرسال الموافقة فإن الناشر سوف يقوم باعتماد الغلاف وطباعة الكتاب دون الرجوع للمؤلف.</li>
                </ul>

                <p className="font-bold mb-2 text-lg">البند الرابع: التزامات المؤلف</p>
                <p className="mb-2">يتعهد ويلتزم المؤلف بما يلي:</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- يسلم المؤلف للناشر مخطوطة الكتاب على شكل نسخة الكترونية WORD مع ملخص حول الكتاب والسيرة الذاتية للمؤلف وأي مستندات لازمة وفقا لتقدير الناشر.</li>
                  <li>2- يكون على المؤلف مراجعة وتصحيح الكتاب المسلم إليه وإعادته إلى الناشر خلال أسبوعين.</li>
                  <li>3- يلتزم المؤلف بإضافة التعديلات والإضافات المستجدة على الكتاب.</li>
                  <li>4- لا يحق للمؤلف طوال مدة العقد منح حق نشر وتوزيع وترجمة الكتاب لأي جهة أخرى إلا بعد أخذ موافقة الناشر المسبقة والخطية على ذلك، وفي حالة مخالفة المؤلف لهذه الشروط تسقط حقوقه المالية عن هذا الكتاب، ويلتزم بدفع جميع الأضرار المادية والمعنوية المترتبة عن ذلك للناشر.</li>
                  <li>5- يتعين على المؤلف أن يلتزم بذكر مصادر ومراجع معلومات الكتاب والبيانات الموجودة فيه وإبراز ما يثبت موافقة المصادر التي منحته تلك المعلومات والبيانات.</li>
                  <li>6- يمنع على المؤلف تحميل وإتاحة النسخة الالكترونية للكتاب على مواقع التواصل الاجتماعي وكل ما يتعلق بالتحميل المجاني عدا الغلاف وفهرس الكتاب.</li>
                </ul>

                <p className="font-bold mb-2 text-lg">البند الخامس: الحقوق المالية</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- يعود للمؤلف ما نسبته 10% من سعر بيع الكتاب بالجملة. (أرباحك المقدرة: {selectedManuscript.royaltyPerSale} د.ج للنسخة)</li>
                  <li>2- تجري المحاسبة بعد بيع 100 نسخة من الكتاب.</li>
                </ul>

                <p className="mb-6"><strong>البند السادس: مدة العقد</strong><br/>مدة هذا العقد 05 سنوات بدءا من تاريخ تحريره.</p>

                <p className="font-bold mb-2 text-lg">البند السابع: أحكام خاصة</p>
                <p className="mb-6">يصرح المؤلف بأنه وحده صاحب حقوق الاستغلال العائدة للكتاب، وبأنه يضمن للناشر بموجب هذا العقد عدم التعرض من الغير بهذا الخصوص، كما يصرح أن هذا الكتاب ليس في مضمونه ما يمنعه القانون وليس فيه نقل أو استعارة بما قد يعرض الناشر للمسؤولية.</p>

                <p className="font-bold mb-2 text-lg">البند الثامن: حل النزاعات</p>
                <p className="mb-6">كل خلاف قد ينشأ عن هذا العقد يحل وديا أو يعرض على محكم واحد يتفق على تعيينه الناشر والمؤلف، وإذا تعذر ذلك فيمكن اللجوء إلى المحاكم بناءا على طلب أحد المتنازعين.</p>

                <p className="font-bold mb-2 text-lg">البند التاسع: الإنهاء</p>
                <p className="mb-8">للناشر الحق في إنهاء هذا العقد في حالة إخفاق المؤلف في أداء أي من التزاماته وفي حالة عدم إجازة الكتاب من قبل لجان دار النشر في أي مرحلة من مراحل إعداد الكتاب أو في حالة عدم موافقة أي من الجهات الخاصة بمنح التراخيص للكتاب.</p>

                <div className="flex justify-between items-start pt-8 pb-16 px-12 border-t-2 border-stone-800">
                  <div className="text-center">
                    <p className="font-bold mb-16 text-lg">الطرف الأول: الناشر</p>
                    <p className="font-bold">دار المتنبي للطباعة والنشر</p>
                    <p className="text-sm">المدير العام: نصر خشاب</p>
                    <p className="mt-8 text-stone-400 italic">موقع إلكترونياً</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold mb-16 text-lg">الطرف الثاني: المؤلف</p>
                    <p className="font-bold">{selectedManuscript.authorName}</p>
                    <p className="mt-8 text-stone-400 italic">موقع إلكترونياً بـ "{selectedManuscript.signatureName}"</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-stone-200 bg-stone-50 flex justify-end gap-3 print:hidden">
                <button 
                  onClick={() => {
                    const blob = new Blob([`هذا ملف تجريبي يمثل المخطوط المرفوع باسم: ${selectedManuscript.uploadedFileName}\nلا يتم حفظ الملفات الفعلية في هذه النسخة التجريبية.`], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = selectedManuscript.uploadedFileName || 'manuscript.txt';
                    link.click();
                  }}
                  className="bg-brand-50 text-brand-900 border border-brand-200 hover:bg-brand-100 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                >
                  <Download size={16} />
                  تحميل المخطوط
                </button>
                <button 
                  onClick={() => {
                    const blob = new Blob([selectedManuscript.summary], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `ملخص_${selectedManuscript.bookTitle}.txt`;
                    link.click();
                  }}
                  className="bg-stone-200 text-stone-700 hover:bg-stone-300 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                >
                  <Download size={16} />
                  تحميل الملخص
                </button>
                <button 
                  onClick={() => {
                    const element = document.getElementById('contract-print-area');
                    if (element) {
                      element.classList.remove('hidden');
                      element.classList.remove('print:block');
                      
                      const opt = {
                        margin:       10,
                        filename:     `contract_${selectedManuscript.bookTitle}.pdf`,
                        image:        { type: 'jpeg', quality: 0.98 },
                        html2canvas:  { scale: 2, useCORS: true },
                        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                      };
                      
                      html2pdf().from(element).set(opt).save().then(() => {
                        element.classList.add('hidden');
                        element.classList.add('print:block');
                      });
                    }
}}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-4 py-2 rounded text-sm font-bold flex items-center gap-2"
                >
                  <Printer size={16} />
                  طباعة العقد
                </button>
                <button 
                  onClick={() => setSelectedManuscript(null)}
                  className="bg-brand-900 text-white hover:bg-brand-850 px-6 py-2 rounded text-sm font-bold"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Existing Messages Tab Content */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
              <h2 className="font-serif font-bold text-brand-900 text-sm">استفسارات ورسائل زوار دار المتنبي</h2>
            </div>
            <div className="p-6">
              {allMessages.length === 0 ? (
                <div className="text-stone-400 text-center py-12 text-xs">لا توجد رسائل تواصل واردة بعد.</div>
              ) : (
                <div className="space-y-4">
                  {allMessages.map((msg: any) => (
                    <div key={msg.id} className="p-5 bg-stone-50 rounded-lg border border-stone-200 space-y-3">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs border-b border-stone-200 pb-2">
                        <div>
                          <span className="font-bold text-brand-900 text-sm">{msg.name}</span>
                          <span className="text-stone-400 mr-2 font-mono">({msg.email})</span>
                        </div>
                        <span className="text-stone-400 font-mono">{new Date(msg.createdAt).toLocaleString("ar-EG")}</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-800 text-sm mb-1 font-serif">الموضوع: {msg.subject}</h4>
                        <p className="text-stone-600 text-xs leading-relaxed whitespace-pre-line">{msg.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
