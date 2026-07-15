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
  const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '', totalPrintCost: '', pageCount: 0, coverType: 'paperback', printCopies: 0 });
  const [isUpdatingManuscript, setIsUpdatingManuscript] = useState(false);

  const handleEditManuscriptClick = (sub: any) => {
    setSelectedManuscript(sub);
    setManuscriptForm({
      status: sub.status || 'submitted',
      retailPrice: sub.retailPrice || '', 
      productionCostPerBook: sub.productionCostPerBook || '',
      totalPrintCost: sub.totalPrintCost || '',
      pageCount: sub.pageCount || 150,
      coverType: sub.coverType || 'paperback',
      printCopies: sub.printCopies || 1000
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
          productionCostPerBook: manuscriptForm.productionCostPerBook,
          pageCount: manuscriptForm.pageCount,
          coverType: manuscriptForm.coverType,
          printCopies: manuscriptForm.printCopies,
          totalPrintCost: manuscriptForm.totalPrintCost ? manuscriptForm.totalPrintCost : (parseFloat(manuscriptForm.productionCostPerBook || "0") * manuscriptForm.printCopies).toString()
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
                      <p className="text-stone-500 text-xs mb-1">تكلفة الإنتاج الإجمالية</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.totalPrintCost ? parseFloat(selectedManuscript.totalPrintCost).toLocaleString() : '0'} د.ج</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">سعر البيع المقترح</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.retailPrice} د.ج</p>
                    </div>
                  </div>
                  {isEditingManuscript ? (
                    <div className="p-4 bg-stone-100 border-t border-stone-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">عدد الصفحات</label>
                          <input 
                            type="number"
                            value={manuscriptForm.pageCount}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, pageCount: parseInt(e.target.value) || 0})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">نوع الغلاف</label>
                          <select 
                            value={manuscriptForm.coverType}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, coverType: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          >
                            <option value="paperback">ورقي عادي</option>
                            <option value="hardcover">مجلد فني</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">عدد النسخ</label>
                          <input 
                            type="number"
                            value={manuscriptForm.printCopies}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, printCopies: parseInt(e.target.value) || 0})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">تكلفة الإنتاج الإجمالية (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.totalPrintCost}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, totalPrintCost: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="تلقائي..."
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">حالة المخطوط</label>
                          <select 
                            value={manuscriptForm.status}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, status: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          >
                            <option value="pending_review">تم الإيداع (قيد المراجعة)</option>
                            <option value="awaiting_author_approval">في انتظار موافقة المؤلف (العرض جاهز)</option>
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
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <button 
                            onClick={handleSaveManuscript}
                            disabled={isUpdatingManuscript}
                            className="bg-brand-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-850 disabled:opacity-50"
                          >
                            {isUpdatingManuscript ? "جاري الحفظ..." : "حفظ"}
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
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center print:hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-700">الحالة:</span>
                        <span className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold text-brand-900">
                          {selectedManuscript.status === 'contract_signed' ? 'تم توقيع العقد' : 
                           selectedManuscript.status === 'in_review' ? 'قيد التحرير' : 
                           selectedManuscript.status === 'printed' ? 'جاهز ومطبوع' : 
                           selectedManuscript.status === 'awaiting_author_approval' ? 'في انتظار موافقة المؤلف' : 
                           'قيد المراجعة'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsEditingManuscript(true)}
                        className="bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-stone-900"
                      >
                        تعديل الحالة والسعر
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
