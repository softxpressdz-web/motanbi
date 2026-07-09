import React, { useState } from "react";
import { 
  Plus, Trash2, Edit3, Tag, Newspaper, Percent, Check, AlertCircle, Loader2
} from "lucide-react";

interface AdminCouponsBlogProps {
  allCoupons: any[];
  allBlogPosts: any[];
  allCategories: any[];
  onRefresh: () => void;
}

export function AdminCouponsBlog({ 
  allCoupons, allBlogPosts, allCategories, onRefresh 
}: AdminCouponsBlogProps) {
  const [subTab, setSubTab] = useState<"coupons" | "blog">("coupons");

  // Coupon States
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any | null>(null);
  const [cpCode, setCpCode] = useState("");
  const [cpType, setCpType] = useState("percentage");
  const [cpValue, setCpValue] = useState("");
  const [cpMaxUses, setCpMaxUses] = useState("");

  // Blog States
  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any | null>(null);
  const [blTitle, setBlTitle] = useState("");
  const [blContent, setBlContent] = useState("");
  const [blImg, setBlImg] = useState("");
  const [blCatId, setBlCatId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon Actions
  const openAddCoupon = () => {
    setEditingCoupon(null);
    setCpCode("");
    setCpType("percentage");
    setCpValue("");
    setCpMaxUses("100");
    setError(null);
    setIsCouponModalOpen(true);
  };

  const openEditCoupon = (cp: any) => {
    setEditingCoupon(cp);
    setCpCode(cp.code || "");
    setCpType(cp.discountType || "percentage");
    setCpValue(cp.value ? cp.value.toString() : "");
    setCpMaxUses(cp.maxUses ? cp.maxUses.toString() : "100");
    setError(null);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode || !cpValue) return;
    setLoading(true);
    setError(null);

    const payload = {
      code: cpCode,
      discountType: cpType,
      value: cpValue,
      maxUses: cpMaxUses ? parseInt(cpMaxUses) : null,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days valid
    };

    try {
      const url = editingCoupon ? `/api/coupons/${editingCoupon.id}` : "/api/coupons";
      const method = editingCoupon ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        setIsCouponModalOpen(false);
      } else {
        setError("فشلت عملية الحفظ. تأكد من أن كود الخصم فريد ولا يتكرر بقاعدة البيانات.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (cpId: number) => {
    if (!window.confirm("هل ترغب في تعطيل وحذف كود الخصم هذا؟")) return;
    try {
      const res = await fetch(`/api/coupons/${cpId}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  // Blog Actions
  const openAddBlog = () => {
    setEditingBlog(null);
    setBlTitle("");
    setBlContent("");
    setBlImg("https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=600&q=80");
    setBlCatId(allCategories[0]?.id?.toString() || "");
    setError(null);
    setIsBlogModalOpen(true);
  };

  const openEditBlog = (post: any) => {
    setEditingBlog(post);
    setBlTitle(post.title || "");
    setBlContent(post.content || "");
    setBlImg(post.image || "");
    setBlCatId(post.categoryId ? post.categoryId.toString() : "");
    setError(null);
    setIsBlogModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blTitle || !blContent) return;
    setLoading(true);
    setError(null);

    const payload = {
      title: blTitle,
      content: blContent,
      image: blImg,
      categoryId: blCatId ? parseInt(blCatId) : null
    };

    try {
      const url = editingBlog ? `/api/blog/${editingBlog.id}` : "/api/blog";
      const method = editingBlog ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        setIsBlogModalOpen(false);
      } else {
        setError("فشلت عملية كتابة وحفظ المقال.");
      }
    } catch (err: any) {
      setError(err.message || "فشل الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (postId: number) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف مقال المدونة هذا نهائياً؟")) return;
    try {
      const res = await fetch(`/api/blog/${postId}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Tab select menu */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setSubTab("coupons")}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            subTab === "coupons" 
              ? "border-brand-900 text-brand-900" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Percent size={14} />
          <span>أكواد الخصم الترويجية والعروض ({allCoupons.length})</span>
        </button>
        <button
          onClick={() => setSubTab("blog")}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            subTab === "blog" 
              ? "border-brand-900 text-brand-900" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Newspaper size={14} />
          <span>محتوى مدونة المعرفة للدار ({allBlogPosts.length})</span>
        </button>
      </div>

      {/* Coupons Panel */}
      {subTab === "coupons" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddCoupon}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>إضافة كود خصم ترويجي</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                  <th className="p-4">كود الخصم</th>
                  <th className="p-4">نوع التخفيض</th>
                  <th className="p-4">قيمة الخصم</th>
                  <th className="p-4">أقصى حد للاستخدام</th>
                  <th className="p-4 text-left pl-6">عمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {allCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-stone-400">لا تتوفر أكواد خصم نشطة حالياً بقاعدة البيانات.</td>
                  </tr>
                ) : (
                  allCoupons.map((cp: any) => (
                    <tr key={cp.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-mono font-bold text-brand-900 text-sm">{cp.code}</td>
                      <td className="p-4 font-bold text-stone-700">
                        {cp.discountType === "percentage" ? "نسبة مئوية (%)" : "خصم ثابت بالقيمة (د.ج)"}
                      </td>
                      <td className="p-4 font-mono font-bold text-stone-850">
                        {parseFloat(cp.value).toLocaleString()} {cp.discountType === "percentage" ? "%" : "د.ج"}
                      </td>
                      <td className="p-4 font-mono text-stone-500">{cp.maxUses || "غير محدود"}</td>
                      <td className="p-4 text-left pl-6">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditCoupon(cp)}
                            className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-brand-900 cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCoupon(cp.id)}
                            className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Blog Panel */}
      {subTab === "blog" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddBlog}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>كتابة مقال معرفي جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allBlogPosts.length === 0 ? (
              <div className="col-span-full text-stone-400 text-center py-12 text-xs">لا توجد مقالات منشورة بالمدونة حالياً.</div>
            ) : (
              allBlogPosts.map((post: any) => (
                <div key={post.id} className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-full">
                  <img 
                    src={post.image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=300&q=80"} 
                    alt={post.title} 
                    className="w-full md:w-40 h-36 object-cover border-b md:border-b-0 md:border-l border-stone-150 shrink-0" 
                  />
                  <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <h4 className="font-serif font-bold text-stone-850 text-sm mb-1.5 line-clamp-1">{post.title}</h4>
                      <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-3">{post.content?.replace(/[#*`]/g, "")}</p>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-stone-100 text-[10px] font-bold">
                      <span className="text-stone-400">{new Date(post.publishedAt || Date.now()).toLocaleDateString("ar-EG")}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => openEditBlog(post)}
                          className="text-stone-500 hover:text-brand-900 cursor-pointer"
                        >
                          تعديل المقال
                        </button>
                        <span className="text-stone-200">|</span>
                        <button 
                          onClick={() => handleDeleteBlog(post.id)}
                          className="text-stone-300 hover:text-red-600 cursor-pointer"
                        >
                          حذف نهائي
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h4 className="font-serif font-bold text-stone-850 text-xs">
                {editingCoupon ? "تعديل كود التخفيض" : "إضافة كود تخفيض ترويجي جديد"}
              </h4>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-stone-400 font-bold font-mono hover:text-stone-600">×</button>
            </div>
            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4 text-xs">
              {error && <div className="p-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded">{error}</div>}
              
              <div className="space-y-1">
                <label className="font-bold text-stone-700">كود الخصم (كود فريد بالإنجليزية) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={cpCode}
                  onChange={(e) => setCpCode(e.target.value.toUpperCase())}
                  placeholder="مثال: MOTANABI20"
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">نوع الخصم</label>
                  <select 
                    value={cpType}
                    onChange={(e) => setCpType(e.target.value)}
                    className="border border-stone-250 rounded px-2.5 py-2 w-full focus:outline-none focus:border-brand-900 font-bold text-stone-700"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (د.ج)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">قيمة التخفيض <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={cpValue}
                    onChange={(e) => setCpValue(e.target.value)}
                    placeholder="20"
                    className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">أقصى عدد مرات للاستخدام</label>
                <input 
                  type="number" 
                  min="1"
                  value={cpMaxUses}
                  onChange={(e) => setCpMaxUses(e.target.value)}
                  placeholder="100"
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-150 pt-4 mt-6">
                <button type="button" onClick={() => setIsCouponModalOpen(false)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-1.5 px-4 rounded">إلغاء</button>
                <button type="submit" disabled={loading} className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-1.5 px-5 rounded flex items-center gap-1 shadow-sm">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>حفظ وتفعيل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blog Modal */}
      {isBlogModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h4 className="font-serif font-bold text-stone-850 text-xs">
                {editingBlog ? "تعديل مقال المدونة" : "كتابة مقال معرفي جديد للدار"}
              </h4>
              <button onClick={() => setIsBlogModalOpen(false)} className="text-stone-400 font-bold font-mono hover:text-stone-600">×</button>
            </div>
            <form onSubmit={handleSaveBlog} className="p-6 space-y-4 text-xs">
              {error && <div className="p-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">عنوان المقال <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={blTitle}
                    onChange={(e) => setBlTitle(e.target.value)}
                    placeholder="أدخل عنوان المقال الجذاب..."
                    className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">تصنيف المقال</label>
                  <select 
                    value={blCatId}
                    onChange={(e) => setBlCatId(e.target.value)}
                    className="border border-stone-250 rounded px-2.5 py-2 w-full focus:outline-none focus:border-brand-900 font-bold text-stone-700"
                  >
                    <option value="">اختر تصنيف المقال...</option>
                    {allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">صورة المقال والافتتاحية (رابط URL)</label>
                <input 
                  type="url" 
                  value={blImg}
                  onChange={(e) => setBlImg(e.target.value)}
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">مضمون المقال ومحتواه</label>
                <textarea 
                  rows={8}
                  required
                  value={blContent}
                  onChange={(e) => setBlContent(e.target.value)}
                  placeholder="اكتب المقال أو البحث العلمي المعرفي بالتفصيل هنا..."
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-150 pt-4 mt-6">
                <button type="button" onClick={() => setIsBlogModalOpen(false)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-1.5 px-4 rounded">إلغاء</button>
                <button type="submit" disabled={loading} className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-1.5 px-5 rounded flex items-center gap-1 shadow-sm">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>نشر وتثبيت المقال</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
