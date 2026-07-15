import React, { useState } from "react";
import { 
  BookOpen, Plus, Trash2, Edit3, Check, Loader2, Image as ImageIcon, Sparkles
} from "lucide-react";

interface AdminBooksProps {
  allBooks: any[];
  allCategories: any[];
  onRefresh: () => void;
}

const COVER_PRESETS = [
  { name: "تاريخ وحضارة", url: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80" },
  { name: "رواية وأدب", url: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80" },
  { name: "فلسفة وفكر", url: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80" },
  { name: "علوم ومعرفة", url: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80" },
  { name: "شعر وقصائد", url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80" }
];

export function AdminBooks({ allBooks, allCategories, onRefresh }: AdminBooksProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [stock, setStock] = useState("10");
  const [isbn, setIsbn] = useState("");
  const [pages, setPages] = useState("");
  const [language, setLanguage] = useState("العربية");
  const [publishYear, setPublishYear] = useState("2026");
  const [publisher, setPublisher] = useState("دار المتنبي للنشر والتوزيع");
  const [coverImage, setCoverImage] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [tableOfContents, setTableOfContents] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("available");
  const [isCompressing, setIsCompressing] = useState(false);

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const openAddModal = () => {
    setEditingBook(null);
    setTitle("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setStock("10");
    setIsbn("");
    setPages("");
    setLanguage("العربية");
    setPublishYear("2026");
    setPublisher("دار المتنبي للنشر والتوزيع");
    setCoverImage(COVER_PRESETS[1].url); // default رواية وأدب
    setImages([]);
    setTableOfContents("");
    setCategoryId("");
    setStatus("available");
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: any) => {
    setEditingBook(book);
    setTitle(book.title || "");
    setDescription(book.description || "");
    setPrice(book.price ? book.price.toString() : "");
    setDiscountPrice(book.discountPrice ? book.discountPrice.toString() : "");
    setStock(book.stock ? book.stock.toString() : "0");
    setIsbn(book.isbn || "");
    setPages(book.pages ? book.pages.toString() : "");
    setLanguage(book.language || "العربية");
    setPublishYear(book.publishYear ? book.publishYear.toString() : "2026");
    setPublisher(book.publisher || "دار المتنبي للنشر والتوزيع");
    setCoverImage(book.coverImage || book.image || "");
    setImages(book.images || []);
    setTableOfContents(book.tableOfContents || "");
    setCategoryId(book.categoryId ? book.categoryId.toString() : "");
    setStatus(book.status || "available");
    setFormError(null);
    setFormSuccess(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    const reader = new FileReader();
    reader.readAsDataURL(file as unknown as Blob);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // max width for book covers
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        setCoverImage(compressedDataUrl);
        setIsCompressing(false);
      };
    };
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    let processedImages: string[] = [];
    let filesProcessed = 0;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.readAsDataURL(file as unknown as Blob);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          processedImages.push(compressedDataUrl);
          filesProcessed++;

          if (filesProcessed === files.length) {
            setImages((prev) => [...prev, ...processedImages]);
            setIsCompressing(false);
          }
        };
      };
    });
  };

  const handleSaveBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) {
      setFormError("يرجى ملء الحقول الإجبارية (العنوان والسعر)");
      return;
    }

    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const payload = {
      title,
      description,
      price: parseFloat(price),
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      stock: parseInt(stock),
      isbn,
      pages: pages ? parseInt(pages) : null,
      language,
      publishYear: parseInt(publishYear),
      publisher,
      coverImage,
      images,
      tableOfContents,
      categoryId: categoryId ? parseInt(categoryId) : null,
      status
    };

    try {
      const url = editingBook ? `/api/books/${editingBook.id}` : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("حدث خطأ أثناء الاتصال بالخادم وحفظ الكتاب.");
      }

      const resData = await response.json();
      if (resData.status === "success") {
        setFormSuccess(editingBook ? "تم تحديث الكتاب بنجاح!" : "تم إضافة الكتاب بنجاح لقاعدة البيانات!");
        onRefresh();
        setTimeout(() => setIsModalOpen(false), 1200);
      } else {
        setFormError(resData.message || "حدث خطأ غير متوقع.");
      }
    } catch (err: any) {
      setFormError(err.message || "فشل الاتصال بالخادم.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async (bookId: number, currentStatus: string) => {
    const nextStatus = currentStatus === "available" ? "unavailable" : "available";
    try {
      const res = await fetch(`/api/books/${bookId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Failed to toggle book status", error);
    }
  };

  const handleQuickStockUpdate = async (bookId: number, currentStock: number, change: number) => {
    const nextStock = Math.max(0, currentStock + change);
    try {
      const res = await fetch(`/api/books/${bookId}/stock`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: nextStock })
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Failed to update stock quick", error);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!window.confirm("هل أنت متأكد تماماً من رغبتك في حذف هذا الكتاب نهائياً من قاعدة البيانات؟")) {
      return;
    }
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: "DELETE"
      });
      if (res.ok) onRefresh();
    } catch (error) {
      console.error("Failed to delete book", error);
    }
  };

  // Filter books list
  const filteredBooks = allBooks.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          book.isbn?.includes(searchQuery) ||
                          book.publisher?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || book.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Top action and filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="ابحث بالعنوان، الناشر أو رقم الـ ISBN..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs w-full sm:w-64 focus:outline-none focus:border-brand-900 font-bold"
          />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-stone-250 bg-stone-50 rounded-lg px-3 py-2 text-xs font-bold text-stone-700"
          >
            <option value="all">كل حالات التوفر</option>
            <option value="available">متوفر للبيع</option>
            <option value="unavailable">غير متوفر / معطل</option>
          </select>
        </div>
        
        <button 
          onClick={openAddModal}
          className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition-all flex items-center gap-2 shadow-sm cursor-pointer shrink-0"
        >
          <Plus size={14} />
          <span>إضافة كتاب جديد للدار</span>
        </button>
      </div>

      {/* Main Books Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-stone-50 border-b border-stone-200 px-6 py-4">
          <h3 className="font-serif font-bold text-stone-850 text-xs">سجلات الكتب المتوفرة في المخازن</h3>
        </div>
        
        <div className="overflow-x-auto">
          {filteredBooks.length === 0 ? (
            <div className="text-stone-400 text-center py-12 text-xs">لم يتم العثور على أي كتب تطابق المعايير المحددة.</div>
          ) : (
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                  <th className="p-4">غلاف الكتاب</th>
                  <th className="p-4">العنوان والتفاصيل</th>
                  <th className="p-4">الناشر وسنة النشر</th>
                  <th className="p-4">السعر</th>
                  <th className="p-4">الكمية والمخزون</th>
                  <th className="p-4">الحالة</th>
                  <th className="p-4 text-left pl-6">العمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-150">
                {filteredBooks.map((book: any) => (
                  <tr key={book.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="p-4">
                      <img 
                        src={book.coverImage || book.image || "https://images.unsplash.com/photo-1544947950-fa07a98d237f"} 
                        alt={book.title} 
                        className="w-12 h-16 object-cover rounded shadow-sm border border-stone-150" 
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-stone-850 text-sm mb-1">{book.title}</div>
                      <div className="text-stone-400 text-[10px] font-mono">ISBN: {book.isbn || "غير متوفر"} | {book.pages || "-"} صفحة</div>
                    </td>
                    <td className="p-4">
                      <div className="text-stone-700 font-bold">{book.publisher || "دار المتنبي"}</div>
                      <div className="text-stone-400 text-[10px] mt-0.5">{book.publishYear || "2026"} | {book.language || "العربية"}</div>
                    </td>
                    <td className="p-4 font-mono">
                      <div className="font-bold text-brand-900">{book.price} د.ج</div>
                      {book.discountPrice && (
                        <div className="text-[10px] text-stone-400 line-through mt-0.5">{book.discountPrice} د.ج</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleQuickStockUpdate(book.id, book.stock || 0, -1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-600 font-mono text-sm"
                        >
                          -
                        </button>
                        <span className={`font-mono font-bold text-sm w-8 text-center ${
                          (book.stock || 0) < 5 ? "text-red-600" : "text-stone-850"
                        }`}>
                          {book.stock || 0}
                        </span>
                        <button 
                          onClick={() => handleQuickStockUpdate(book.id, book.stock || 0, 1)}
                          className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 flex items-center justify-center font-bold text-stone-600 font-mono text-sm"
                        >
                          +
                        </button>
                      </div>
                      {(book.stock || 0) < 5 && (
                        <span className="text-[9px] text-red-500 font-bold block mt-1">مخزون منخفض!</span>
                      )}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(book.id, book.status)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                          book.status === "available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            : "bg-stone-100 text-stone-500 border-stone-200 hover:bg-stone-200"
                        }`}
                      >
                        {book.status === "available" ? "نشط" : "معطل"}
                      </button>
                    </td>
                    <td className="p-4 text-left pl-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(book)}
                          className="p-1.5 rounded hover:bg-stone-100 text-stone-500 hover:text-brand-900 transition-colors cursor-pointer"
                          title="تعديل"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Book Add/Edit Dialog Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl border border-stone-200 w-full max-w-2xl overflow-hidden my-8">
            <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-stone-850 text-sm flex items-center gap-2">
                <BookOpen size={18} className="text-brand-900" />
                <span>{editingBook ? "تعديل بيانات الكتاب" : "إضافة كتاب جديد للدار"}</span>
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 text-lg font-mono font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs font-bold">
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded text-green-700 text-xs font-bold flex items-center gap-1">
                  <Check size={14} />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">عنوان الكتاب <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="العنوان الكامل للكتاب..."
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">دار النشر والطباعة</label>
                  <input 
                    type="text" 
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">وصف الكتاب والملخص العام</label>
                <textarea 
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="اكتب ملخصاً جذاباً لمضمون الكتاب..."
                  className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 leading-relaxed font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">فهرس الكتاب (اختياري)</label>
                <textarea 
                  rows={4}
                  value={tableOfContents}
                  onChange={(e) => setTableOfContents(e.target.value)}
                  placeholder="الفصل الأول: ...&#10;الفصل الثاني: ..."
                  className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 leading-relaxed font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">السعر (د.ج) <span className="text-red-500">*</span></label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="4500"
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">سعر التخفيض (اختياري)</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    placeholder="3800"
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">الكمية المتوفرة</label>
                  <input 
                    type="number" 
                    min="0"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">تصنيف الكتاب</label>
                  <select 
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold text-stone-700"
                  >
                    <option value="">بدون تصنيف</option>
                    {allCategories && allCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">حالة الكتاب</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold text-stone-700"
                  >
                    <option value="available">متوفر للبيع ومفعل</option>
                    <option value="unavailable">معطل / غير معروض</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">رقم الـ ISBN</label>
                  <input 
                    type="text" 
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-9931-..."
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">عدد الصفحات</label>
                  <input 
                    type="number" 
                    value={pages}
                    onChange={(e) => setPages(e.target.value)}
                    placeholder="320"
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">سنة النشر</label>
                  <input 
                    type="number" 
                    value={publishYear}
                    onChange={(e) => setPublishYear(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">لغة الكتاب</label>
                  <input 
                    type="text" 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="border border-stone-250 rounded px-3 py-2 text-xs w-full focus:outline-none focus:border-brand-900 font-bold"
                  />
                </div>
              </div>

              {/* Cover Image Selector */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-lg border border-stone-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-brand-900" />
                    <span>رابط صورة غلاف الكتاب</span>
                  </label>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Sparkles size={11} />
                    نصيحة: انقر على أحد القوالب الجاهزة لتغيير الغلاف فوراً!
                  </span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input 
                      type="url" 
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="أدخل رابط صورة الغلاف مباشرة..."
                      className="border border-stone-250 rounded bg-white px-3 py-2 text-xs flex-1 focus:outline-none focus:border-brand-900 font-mono"
                    />
                    <label className="bg-brand-900 hover:bg-brand-850 text-white px-3 py-2 rounded text-xs font-bold cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap">
                      <span>رفع صورة</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload} 
                      />
                    </label>
                  </div>
                  {isCompressing && (
                    <span className="text-[10px] text-brand-900 animate-pulse font-bold">جاري ضغط ومعالجة الصورة...</span>
                  )}
                </div>

                {/* Previews preset cards */}
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {COVER_PRESETS.map((preset, idx) => {
                    const isSelected = coverImage === preset.url;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCoverImage(preset.url)}
                        className={`group relative h-16 rounded overflow-hidden border-2 transition-all cursor-pointer ${
                          isSelected ? "border-brand-900 scale-95 shadow-md" : "border-transparent hover:border-stone-400"
                        }`}
                      >
                        <img 
                          src={preset.url} 
                          alt={preset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] text-white font-bold text-center px-1 leading-tight">{preset.name}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 left-1 w-4 h-4 bg-brand-900 text-white rounded-full flex items-center justify-center text-[8px] font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Additional Images Selector */}
                <div className="mt-4 pt-4 border-t border-stone-200">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-brand-900" />
                      <span>صور إضافية للكتاب (اختياري)</span>
                    </label>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <label className="bg-stone-200 hover:bg-stone-300 text-stone-800 px-3 py-2 rounded text-xs font-bold cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap w-full border border-stone-300 border-dashed">
                        <span>+ رفع صور إضافية المتعددة...</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          className="hidden" 
                          onChange={handleAdditionalImagesUpload} 
                        />
                      </label>
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-5 gap-2 mt-2">
                        {images.map((imgUrl, idx) => (
                          <div key={idx} className="relative h-16 rounded overflow-hidden border border-stone-200 group">
                            <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                            <button
                              type="button"
                              onClick={() => setImages(prev => prev.filter((_, i) => i !== idx))}
                              className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center text-[10px] rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-stone-150 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 px-5 rounded text-xs transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-brand-900 hover:bg-brand-800 text-white font-bold py-2 px-6 rounded text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  {formLoading && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingBook ? "تعديل وحفظ التغييرات" : "حفظ الكتاب بقاعدة البيانات"}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
