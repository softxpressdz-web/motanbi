import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import { Filter, Star, ShoppingCart, Search, X, CheckCircle2, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_BOOKS, CATEGORIES, Book } from "../lib/booksData";
import { addToCart } from "../lib/cartStore";

export function Shop() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Read params
  const categoryParam = searchParams.get("category");
  const levelParam = searchParams.get("level");
  const searchParam = searchParams.get("search");
  
  const [activeSort, setActiveSort] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [localSearch, setLocalSearch] = useState("");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL params
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    } else {
      setSelectedCategories([]);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (searchParam) {
      setLocalSearch(searchParam);
    } else {
      setLocalSearch("");
    }
  }, [searchParam]);

  const handleCategoryCheckboxChange = (category: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        const updated = prev.filter(c => c !== category);
        // Sync with URL if it was the only one
        if (updated.length === 1) {
          setSearchParams({ category: updated[0] });
        } else {
          searchParams.delete("category");
          setSearchParams(searchParams);
        }
        return updated;
      } else {
        setSearchParams({ category });
        return [category];
      }
    });
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setLocalSearch("");
    setSearchParams({});
  };

  // Add item to cart
  const handleAddToCart = (e: React.MouseEvent, book: Book) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    
    setSuccessToast(`تم إضافة "${book.title}" إلى السلة بنجاح!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  // Filter books dynamically
  let filteredBooks = [...ALL_BOOKS];

  // 1. Filter by categories
  if (selectedCategories.length > 0) {
    filteredBooks = filteredBooks.filter(book => selectedCategories.includes(book.category));
  } else if (levelParam) {
    // School level subcategory filter
    filteredBooks = filteredBooks.filter(book => book.category === "كتب مدرسية" && book.schoolLevel === levelParam);
  }

  // 2. Filter by Search Query
  if (localSearch.trim()) {
    const q = localSearch.toLowerCase().trim();
    filteredBooks = filteredBooks.filter(book => 
      book.title.toLowerCase().includes(q) || 
      book.author.toLowerCase().includes(q) ||
      book.category.toLowerCase().includes(q)
    );
  }

  // 3. Filter by Price Range
  if (minPrice) {
    filteredBooks = filteredBooks.filter(book => book.price >= parseFloat(minPrice));
  }
  if (maxPrice) {
    filteredBooks = filteredBooks.filter(book => book.price <= parseFloat(maxPrice));
  }

  // 4. Sort
  filteredBooks.sort((a, b) => {
    if (activeSort === "newest") {
      return b.year - a.year; // newest publishing year first
    }
    if (activeSort === "bestseller") {
      return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
    }
    if (activeSort === "price_asc") {
      return a.price - b.price;
    }
    if (activeSort === "price_desc") {
      return b.price - a.price;
    }
    return 0;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8 text-stone-850" dir="rtl">
      
      {/* Toast Alert */}
      <AnimatePresence>
        {successToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-900 text-white px-6 py-3.5 rounded-lg shadow-2xl border-l-[4px] border-accent-gold z-50 flex items-center gap-3 text-sm font-semibold min-w-[300px]"
          >
            <CheckCircle2 className="text-accent-gold shrink-0" size={20} />
            <span className="flex-1 text-right">{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar Filters (Desktop) */}
      <aside className="hidden md:block w-64 shrink-0 space-y-8">
        <div className="bg-white p-5 rounded-lg border border-stone-150 shadow-sm sticky top-28">
          <div className="flex justify-between items-center mb-4 border-b border-stone-150 pb-2.5">
            <h3 className="font-bold text-brand-900 flex items-center gap-2 text-base">
              <Filter size={18} className="text-accent-gold" /> تصفية الكتب
            </h3>
            <button 
              onClick={handleResetFilters}
              className="text-xs text-stone-400 hover:text-red-500 font-bold transition-colors cursor-pointer"
            >
              إعادة تعيين
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Search filter inside sidebar */}
            <div>
              <h4 className="font-semibold mb-2.5 text-xs text-stone-500 uppercase tracking-wider">بحث مخصص</h4>
              <div className="relative">
                <input 
                  type="text" 
                  value={localSearch}
                  onChange={(e) => {
                    setLocalSearch(e.target.value);
                    setSearchParams({ search: e.target.value });
                  }}
                  placeholder="ابحث هنا..." 
                  className="w-full pl-3 pr-8 py-2 border border-stone-200 rounded text-xs focus:outline-none focus:border-accent-gold"
                />
                <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              </div>
            </div>

            {/* Categories filter */}
            <div>
              <h4 className="font-semibold mb-3 text-xs text-stone-500 uppercase tracking-wider">التصنيفات</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1 text-xs text-stone-600 custom-scrollbar">
                {CATEGORIES.slice(1).map((category, idx) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer py-0.5 hover:text-brand-900 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.includes(category)}
                      onChange={() => handleCategoryCheckboxChange(category)}
                      className="rounded text-accent-gold focus:ring-accent-gold accent-accent-gold w-3.5 h-3.5 border-stone-300" 
                    /> 
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Price filter */}
            <div>
              <h4 className="font-semibold mb-3 text-xs text-stone-500 uppercase tracking-wider">نطاق السعر (د.ج)</h4>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="من" 
                  className="w-full p-2 border border-stone-200 rounded text-xs focus:outline-none focus:border-accent-gold" 
                />
                <span className="text-stone-400 text-xs">إلى</span>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="إلى" 
                  className="w-full p-2 border border-stone-200 rounded text-xs focus:outline-none focus:border-accent-gold" 
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top bar controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <h1 className="text-2xl font-serif font-bold text-brand-900">
              {categoryParam ? `كتب: ${categoryParam}` : levelParam ? `الكتب المدرسية: طور ${levelParam}` : "كافة الكتب والمقررات"}
            </h1>
            <p className="text-xs text-stone-400 mt-1">عرض {filteredBooks.length} كتاب متوفر حالياً</p>
          </div>
          
          <div className="flex items-center justify-between w-full sm:w-auto gap-4">
            {/* Mobile Filter Trigger Button */}
            <button 
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden flex items-center gap-1.5 bg-white border border-stone-250 hover:border-brand-900 rounded px-4 py-2 text-stone-700 text-xs font-semibold cursor-pointer"
            >
              <SlidersHorizontal size={14} />
              <span>التصفية</span>
            </button>

            <div className="flex items-center gap-2 text-xs text-stone-600">
              <span>ترتيب:</span>
              <select 
                value={activeSort} 
                onChange={(e) => setActiveSort(e.target.value)}
                className="bg-white border border-stone-250 rounded px-2 py-1.5 focus:outline-none focus:border-accent-gold text-xs font-semibold text-stone-700 cursor-pointer"
              >
                <option value="newest">الأحدث نشرأً</option>
                <option value="bestseller">الأكثر مبيعاً</option>
                <option value="price_asc">السعر: من الأقل للأكثر</option>
                <option value="price_desc">السعر: من الأكثر للأقل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Selected parameters pills */}
        {(selectedCategories.length > 0 || levelParam || localSearch) && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedCategories.map(cat => (
              <span key={cat} className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-900 text-xs px-2.5 py-1 rounded">
                <span>التصنيف: {cat}</span>
                <X size={12} className="cursor-pointer" onClick={() => handleCategoryCheckboxChange(cat)} />
              </span>
            ))}
            {levelParam && (
              <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-900 text-xs px-2.5 py-1 rounded">
                <span>الطور: {levelParam}</span>
                <X size={12} className="cursor-pointer" onClick={() => {
                  searchParams.delete("level");
                  setSearchParams(searchParams);
                }} />
              </span>
            )}
            {localSearch && (
              <span className="inline-flex items-center gap-1 bg-brand-50 border border-brand-100 text-brand-900 text-xs px-2.5 py-1 rounded">
                <span>بحث: "{localSearch}"</span>
                <X size={12} className="cursor-pointer" onClick={() => {
                  setLocalSearch("");
                  searchParams.delete("search");
                  setSearchParams(searchParams);
                }} />
              </span>
            )}
            <button 
              onClick={handleResetFilters}
              className="text-xs text-red-500 hover:underline font-bold"
            >
              تصفية الكل
            </button>
          </div>
        )}

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-lg border border-dashed border-stone-200">
            <Search size={40} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500 font-bold text-lg">لم نعثر على أي نتائج تطابق البحث أو التصفية.</p>
            <p className="text-stone-400 text-sm mt-1">يرجى تجربة كلمات بحث أخرى أو مسح مرشحات التصفية.</p>
            <button 
              onClick={handleResetFilters}
              className="mt-6 bg-brand-900 text-white px-6 py-2.5 rounded font-bold hover:bg-brand-850 text-sm"
            >
              إلغاء التصفية وعرض الكل
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <motion.div 
                key={book.id} 
                layout
                className="group flex flex-col bg-white p-4 rounded-lg border border-stone-150 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded bg-stone-50 shadow-inner">
                  <img 
                    src={book.coverImage || book.image} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  {book.isBestseller && (
                    <div className="absolute top-2.5 right-2.5 bg-accent-gold text-brand-900 font-bold text-[10px] px-2.5 py-1 rounded shadow">
                      موصى به
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col flex-1">
                  <h3 className="font-bold text-lg text-brand-900 font-serif leading-snug group-hover:text-accent-gold transition-colors line-clamp-1">
                    {book.title}
                  </h3>
                  <p className="text-stone-500 text-sm mt-1">{book.author}</p>
                  
                  <div className="flex items-center gap-1 text-accent-gold mt-2">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={13} fill={j < book.rating ? "currentColor" : "none"} className={j < book.rating ? "text-accent-gold" : "text-stone-200"} />
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100 mt-4">
                    <span className="font-bold text-brand-900 text-base">{book.price} د.ج</span>
                    <button 
                      onClick={(e) => handleAddToCart(e, book)}
                      className="w-9 h-9 rounded-full bg-stone-100 text-brand-900 flex items-center justify-center hover:bg-brand-900 hover:text-white transition-all shadow-sm"
                      title="أضف إلى السلة"
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowMobileFilters(false)}
          ></div>

          {/* Drawer content */}
          <div className="relative flex flex-col w-full max-w-xs bg-white text-stone-800 shadow-2xl h-full z-50 mr-auto animate-slide-in">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <h3 className="font-bold text-brand-900 text-base">تصفية الكتب</h3>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Categories */}
              <div>
                <h4 className="font-bold text-xs text-stone-400 mb-3 uppercase tracking-wider">التصنيفات</h4>
                <div className="space-y-3">
                  {CATEGORIES.slice(1).map((category, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input 
                        type="checkbox" 
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryCheckboxChange(category)}
                        className="rounded text-accent-gold focus:ring-accent-gold accent-accent-gold w-4 h-4 border-stone-300" 
                      /> 
                      <span>{category}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="border-t border-stone-100 pt-5">
                <h4 className="font-bold text-xs text-stone-400 mb-3 uppercase tracking-wider">السعر (د.ج)</h4>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من" 
                    className="w-full p-2 border border-stone-200 rounded text-sm focus:outline-none focus:border-accent-gold" 
                  />
                  <span>-</span>
                  <input 
                    type="number" 
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى" 
                    className="w-full p-2 border border-stone-200 rounded text-sm focus:outline-none focus:border-accent-gold" 
                  />
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-stone-100 flex gap-2">
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-brand-900 text-white text-sm py-3 rounded font-bold hover:bg-brand-850"
              >
                موافق
              </button>
              <button 
                onClick={() => { handleResetFilters(); setShowMobileFilters(false); }}
                className="flex-1 border border-stone-200 text-stone-600 text-sm py-3 rounded font-bold hover:bg-stone-50"
              >
                مسح الكل
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
