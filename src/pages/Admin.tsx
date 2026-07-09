import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, DollarSign, BookOpen, ScrollText, Mail, Users, 
  ShieldAlert, Loader2, RefreshCw, Handshake, Tag, Percent, Newspaper, Settings
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
                          <div className="text-accent-gold font-bold text-[10px] mt-0.5">أرباح الكاتب: {sub.royaltyPerSale} د.ج (15%)</div>
                        </td>
                        <td className="p-3 text-left pl-6 font-mono font-bold text-emerald-600">
                          "{sub.signatureName || "موقّع"}"
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
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
