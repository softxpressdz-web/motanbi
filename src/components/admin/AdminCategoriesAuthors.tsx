import React, { useState } from "react";
import { 
  Plus, Trash2, Edit3, Tag, Users, Check, AlertCircle, Loader2
} from "lucide-react";

interface AdminCategoriesAuthorsProps {
  allCategories: any[];
  allAuthors: any[];
  onRefresh: () => void;
}

export function AdminCategoriesAuthors({ 
  allCategories, allAuthors, onRefresh 
}: AdminCategoriesAuthorsProps) {
  const [subTab, setSubTab] = useState<"categories" | "authors">("categories");

  // Category Form State
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");

  // Author Form State
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<any | null>(null);
  const [authName, setAuthName] = useState("");
  const [authBio, setAuthBio] = useState("");
  const [authImg, setAuthImg] = useState("");
  const [authSocials, setAuthSocials] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category Actions
  const openAddCategory = () => {
    setEditingCategory(null);
    setCatName("");
    setCatDesc("");
    setError(null);
    setIsCatModalOpen(true);
  };

  const openEditCategory = (cat: any) => {
    setEditingCategory(cat);
    setCatName(cat.name || "");
    setCatDesc(cat.description || "");
    setError(null);
    setIsCatModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    setLoading(true);
    setError(null);

    const payload = { name: catName, description: catDesc };

    try {
      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        setIsCatModalOpen(false);
      } else {
        setError("فشلت العملية، يرجى المحاولة لاحقاً.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (catId: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا التصنيف نهائياً؟")) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete category", err);
    }
  };

  // Author Actions
  const openAddAuthor = () => {
    setEditingAuthor(null);
    setAuthName("");
    setAuthBio("");
    setAuthImg("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80");
    setAuthSocials("");
    setError(null);
    setIsAuthorModalOpen(true);
  };

  const openEditAuthor = (auth: any) => {
    setEditingAuthor(auth);
    setAuthName(auth.name || "");
    setAuthBio(auth.bio || "");
    setAuthImg(auth.image || "");
    setAuthSocials(auth.socialLinks || "");
    setError(null);
    setIsAuthorModalOpen(true);
  };

  const handleSaveAuthor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authName) return;
    setLoading(true);
    setError(null);

    const payload = { 
      name: authName, 
      bio: authBio, 
      image: authImg, 
      socialLinks: authSocials 
    };

    try {
      const url = editingAuthor ? `/api/authors/${editingAuthor.id}` : "/api/authors";
      const method = editingAuthor ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onRefresh();
        setIsAuthorModalOpen(false);
      } else {
        setError("فشلت العملية، يرجى المحاولة لاحقاً.");
      }
    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuthor = async (authId: number) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الكاتب الموقّع نهائياً من قاعدة البيانات؟")) return;
    try {
      const res = await fetch(`/api/authors/${authId}`, { method: "DELETE" });
      if (res.ok) onRefresh();
    } catch (err) {
      console.error("Failed to delete author", err);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Sub tabs menu */}
      <div className="flex border-b border-stone-200">
        <button
          onClick={() => setSubTab("categories")}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            subTab === "categories" 
              ? "border-brand-900 text-brand-900" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Tag size={14} />
          <span>إدارة التصنيفات والمجالات الأكاديمية ({allCategories.length})</span>
        </button>
        <button
          onClick={() => setSubTab("authors")}
          className={`py-3 px-6 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            subTab === "authors" 
              ? "border-brand-900 text-brand-900" 
              : "border-transparent text-stone-500 hover:text-stone-700"
          }`}
        >
          <Users size={14} />
          <span>إدارة الكتاب والمؤلفين المعتمدين ({allAuthors.length})</span>
        </button>
      </div>

      {/* Categories Panel */}
      {subTab === "categories" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddCategory}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>إضافة تصنيف جديد</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                  <th className="p-4">اسم التصنيف</th>
                  <th className="p-4">الوصف والتفاصيل</th>
                  <th className="p-4 text-left pl-6">عمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {allCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-6 text-center text-stone-400">لا توجد تصنيفات معرفة حالياً في قاعدة البيانات.</td>
                  </tr>
                ) : (
                  allCategories.map((cat: any) => (
                    <tr key={cat.id} className="hover:bg-stone-50/50">
                      <td className="p-4 font-bold text-stone-800">{cat.name}</td>
                      <td className="p-4 text-stone-500 max-w-sm overflow-hidden truncate">{cat.description || "-"}</td>
                      <td className="p-4 text-left pl-6">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => openEditCategory(cat)}
                            className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-brand-900 cursor-pointer"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDeleteCategory(cat.id)}
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

      {/* Authors Panel */}
      {subTab === "authors" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openAddAuthor}
              className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>إضافة كاتب أو مؤلف جديد للدار</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allAuthors.length === 0 ? (
              <div className="col-span-full text-stone-400 text-center py-12 text-xs">لا يوجد كتاب مسجلون حالياً.</div>
            ) : (
              allAuthors.map((auth: any) => (
                <div key={auth.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-start gap-4">
                  <img 
                    src={auth.image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"} 
                    alt={auth.name} 
                    className="w-16 h-16 rounded-full object-cover border border-stone-150 shrink-0" 
                  />
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h4 className="font-bold text-stone-850 text-sm truncate">{auth.name}</h4>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">{auth.bio || "لا تتوفر سيرة ذاتية قصيرة للكاتب."}</p>
                    {auth.socialLinks && (
                      <div className="text-[10px] text-brand-900 font-mono truncate font-bold">{auth.socialLinks}</div>
                    )}
                    <div className="flex gap-2 pt-1 justify-end">
                      <button 
                        onClick={() => openEditAuthor(auth)}
                        className="text-stone-400 hover:text-brand-900 transition-colors text-[10px] font-bold cursor-pointer"
                      >
                        تعديل البيانات
                      </button>
                      <span className="text-stone-200">|</span>
                      <button 
                        onClick={() => handleDeleteAuthor(auth.id)}
                        className="text-stone-300 hover:text-red-600 transition-colors text-[10px] font-bold cursor-pointer"
                      >
                        حذف الكاتب
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Category Modal */}
      {isCatModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h4 className="font-serif font-bold text-stone-850 text-xs">
                {editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد للكتب"}
              </h4>
              <button onClick={() => setIsCatModalOpen(false)} className="text-stone-400 font-bold font-mono hover:text-stone-600">×</button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4 text-xs">
              {error && <div className="p-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded">{error}</div>}
              
              <div className="space-y-1">
                <label className="font-bold text-stone-700">اسم التصنيف <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="مثال: الروايات، العلوم الاجتماعية، كتب دينية..."
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">شرح وتفاصيل التصنيف</label>
                <textarea 
                  rows={3}
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="شرح بسيط لمحتوى هذا التصنيف..."
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-medium leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-150 pt-4 mt-6">
                <button type="button" onClick={() => setIsCatModalOpen(false)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-1.5 px-4 rounded">إلغاء</button>
                <button type="submit" disabled={loading} className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-1.5 px-5 rounded flex items-center gap-1 shadow-sm">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>حفظ البيانات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Author Modal */}
      {isAuthorModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h4 className="font-serif font-bold text-stone-850 text-xs">
                {editingAuthor ? "تعديل بيانات الكاتب" : "إضافة كاتب جديد للمنظومة"}
              </h4>
              <button onClick={() => setIsAuthorModalOpen(false)} className="text-stone-400 font-bold font-mono hover:text-stone-600">×</button>
            </div>
            <form onSubmit={handleSaveAuthor} className="p-6 space-y-4 text-xs">
              {error && <div className="p-2.5 bg-red-50 text-red-700 font-bold border border-red-200 rounded">{error}</div>}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">اسم الكاتب الكامل <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="الاسم الكامل للكاتب المعتمد..."
                    className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">روابط التواصل (بريد / موقع)</label>
                  <input 
                    type="text" 
                    value={authSocials}
                    onChange={(e) => setAuthSocials(e.target.value)}
                    placeholder="البريد الإلكتروني للاتصال..."
                    className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">صورة الكاتب (رابط URL)</label>
                <input 
                  type="url" 
                  value={authImg}
                  onChange={(e) => setAuthImg(e.target.value)}
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">نبذة وسيرة ذاتية قصيرة للكاتب</label>
                <textarea 
                  rows={4}
                  value={authBio}
                  onChange={(e) => setAuthBio(e.target.value)}
                  placeholder="تحدث بإيجاز عن إنجازات ومصنفات هذا الكاتب..."
                  className="border border-stone-250 rounded px-3 py-2 w-full focus:outline-none focus:border-brand-900 leading-relaxed font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-stone-150 pt-4 mt-6">
                <button type="button" onClick={() => setIsAuthorModalOpen(false)} className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-1.5 px-4 rounded">إلغاء</button>
                <button type="submit" disabled={loading} className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-1.5 px-5 rounded flex items-center gap-1 shadow-sm">
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  <span>حفظ البيانات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
