import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { 
  ArrowLeft, Star, TrendingUp, Library, FileText, Users, 
  Award, PenTool, Clock, GraduationCap, ChevronDown, Filter, 
  CheckCircle2, ShoppingCart, ArrowUpRight 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_BOOKS, CATEGORIES } from "../lib/booksData";
import { addToCart } from "../lib/cartStore";

export function Home() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("الكل");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter bestseller books
  const bestsellerBooks = ALL_BOOKS.filter(book => book.isBestseller).slice(0, 4);

  // Filter recent books based on category
  const recentBooks = ALL_BOOKS.filter(book => book.isRecent);
  const filteredRecentBooks = activeCategory === "الكل" 
    ? recentBooks 
    : recentBooks.filter(book => book.category === activeCategory);

  // School books
  const schoolBooks = ALL_BOOKS.filter(book => book.isSchool).slice(0, 4);

  const handleAddToCart = (e: React.MouseEvent, book: any) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(book, 1);
    
    setSuccessToast(`تم إضافة "${book.title}" إلى السلة بنجاح!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  return (
    <div className="flex flex-col pb-0 text-stone-800" dir="rtl">
      
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

      {/* Hero Section */}
      <section className="relative bg-brand-900 text-white overflow-hidden py-24 md:py-32 border-b-[4px] border-accent-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-serif font-bold mb-6 text-stone-100 leading-tight max-w-4xl"
          >
            نأخذك في رحلة عبر عوالم <span className="text-accent-gold font-serif">المعرفة</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-stone-300 mb-10 max-w-2xl font-light leading-relaxed"
          >
            اكتشف مجموعة واسعة من الكتب الأدبية، العلمية، والتاريخية من إصدارات دار المتنبي. نوفر خدمات طباعة راقية وشحن سريع.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link to="/shop" className="w-full sm:w-auto bg-accent-gold hover:bg-accent-gold-hover text-brand-900 font-bold px-8 py-4 rounded shadow-lg flex items-center justify-center gap-2 transition-all hover:translate-y-[-2px]">
              <span>تصفح المتجر</span>
              <ArrowLeft size={18} />
            </Link>
            <Link to="/publish-book" className="w-full sm:w-auto bg-transparent border border-accent-gold hover:bg-accent-gold hover:text-brand-900 text-accent-gold font-bold px-8 py-4 rounded flex items-center justify-center gap-2 transition-all duration-300 group">
              <PenTool size={18} className="group-hover:scale-110 transition-transform" />
              <span>أنشر كتابك معنا</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 w-full py-16 md:py-24">
        <div className="flex justify-between items-end mb-10 border-b border-stone-200 pb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-accent-gold" size={28} />
            <h2 className="text-3xl font-serif font-bold text-brand-900">الأكثر مبيعاً</h2>
          </div>
          <Link to="/shop?sort=bestseller" className="text-sm font-medium text-stone-500 hover:text-brand-900 flex items-center gap-1 transition-colors group">
            <span>عرض الكل</span>
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {bestsellerBooks.map((book, i) => (
            <motion.div 
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group cursor-pointer bg-white rounded-lg border border-stone-150 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
              onClick={() => navigate(`/book/${book.id}`)}
            >
              <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded bg-stone-50 shadow-inner">
                <img 
                  src={book.image} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                  <button 
                    onClick={(e) => handleAddToCart(e, book)}
                    className="bg-white hover:bg-accent-gold hover:text-white text-brand-900 px-5 py-2.5 rounded text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                  >
                    <ShoppingCart size={16} />
                    <span>أضف للسلة</span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col flex-1">
                <h3 className="font-bold text-lg text-brand-900 font-serif leading-tight hover:text-accent-gold transition-colors">{book.title}</h3>
                <p className="text-stone-500 text-sm mt-1">{book.author}</p>
                <div className="flex items-center gap-1 text-accent-gold mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={14} fill={j < book.rating ? "currentColor" : "none"} className={j < book.rating ? "text-accent-gold" : "text-stone-200"} />
                  ))}
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-stone-100 mt-4">
                  <span className="font-bold text-brand-900 text-lg">{book.price} د.ج</span>
                  <span className="text-xs text-stone-400 font-bold bg-stone-50 px-2 py-1 rounded">رائج</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-brand-900 text-stone-300 py-20 relative overflow-hidden border-y-[4px] border-accent-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 w-full relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif font-bold text-white mb-4">دار المتنبي بالأرقام</h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-850 flex items-center justify-center border border-brand-700 group-hover:border-accent-gold transition-all duration-300">
                <Library className="text-accent-gold" size={32} />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">+1500</div>
                <div className="text-stone-400 text-sm font-medium tracking-wide">كتاب منشور وموزع</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-850 flex items-center justify-center border border-brand-700 group-hover:border-accent-gold transition-all duration-300">
                <FileText className="text-accent-gold" size={32} />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">+120</div>
                <div className="text-stone-400 text-sm font-medium tracking-wide">إصدار سنوي جديد</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-850 flex items-center justify-center border border-brand-700 group-hover:border-accent-gold transition-all duration-300">
                <Users className="text-accent-gold" size={32} />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">+400</div>
                <div className="text-stone-400 text-sm font-medium tracking-wide">أستاذ ومؤلف متعاقد</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center gap-4 group"
            >
              <div className="w-20 h-20 rounded-full bg-brand-850 flex items-center justify-center border border-brand-700 group-hover:border-accent-gold transition-all duration-300">
                <Award className="text-accent-gold" size={32} />
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-serif font-bold text-white mb-2">25</div>
                <div className="text-stone-400 text-sm font-medium tracking-wide">سنة من العطاء العلمي</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Recently Published */}
      <section className="max-w-7xl mx-auto px-4 w-full py-16 md:py-24">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 border-b border-stone-200 pb-4 gap-6">
          <div className="flex items-center gap-3 self-start">
            <Clock className="text-accent-gold" size={28} />
            <h2 className="text-3xl font-serif font-bold text-brand-900">نشرت حديثاً</h2>
          </div>
          
          {/* Dropdown Filter for Recent Books */}
          <div className="relative w-full md:w-auto z-20 self-end md:self-auto">
            <button 
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full md:w-64 flex items-center justify-between bg-white border border-stone-250 hover:border-brand-900 rounded px-4 py-3 text-stone-700 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-brand-900 group-hover:text-accent-gold transition-colors" />
                <span className="font-semibold text-sm">{activeCategory}</span>
              </div>
              <ChevronDown size={18} className={`text-stone-400 transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            
            {isCategoryDropdownOpen && (
              <div className="absolute top-full left-0 right-0 md:left-auto md:right-0 md:w-64 mt-2 bg-white border border-stone-100 shadow-2xl rounded max-h-80 overflow-y-auto z-50 py-2">
                {CATEGORIES.slice(0, 15).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 text-sm transition-colors flex items-center justify-between cursor-pointer ${
                      activeCategory === cat
                        ? "bg-brand-50 text-brand-900 font-bold"
                        : "text-stone-600 hover:bg-stone-50 hover:text-brand-900"
                    }`}
                  >
                    <span>{cat}</span>
                    {activeCategory === cat && <div className="w-1.5 h-1.5 rounded-full bg-accent-gold"></div>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {filteredRecentBooks.length === 0 ? (
          <div className="text-center py-16 bg-stone-50 rounded-lg border border-dashed border-stone-200">
            <p className="text-stone-500 font-medium">لا توجد كتب حديثة في قسم "{activeCategory}" حالياً.</p>
            <button 
              onClick={() => setActiveCategory("الكل")}
              className="mt-4 text-brand-900 underline font-bold"
            >
              عرض كافة الإصدارات
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredRecentBooks.slice(0, 8).map((book, index) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer bg-white rounded-lg border border-stone-150 p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <div className="relative aspect-[2/3] mb-4 overflow-hidden rounded bg-stone-50 shadow-inner">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 right-2.5 bg-brand-900 text-accent-gold font-bold text-[10px] px-2 py-1 rounded shadow">
                    جديد
                  </div>
                  <div className="absolute inset-0 bg-brand-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-4">
                    <button 
                      onClick={(e) => handleAddToCart(e, book)}
                      className="bg-white hover:bg-accent-gold hover:text-white text-brand-900 px-5 py-2.5 rounded text-sm font-bold shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all flex items-center gap-2"
                    >
                      <ShoppingCart size={16} />
                      <span>أضف للسلة</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-col flex-1">
                  <h3 className="font-serif font-bold text-lg text-brand-900 group-hover:text-accent-gold transition-colors line-clamp-1">{book.title}</h3>
                  <p className="text-stone-500 text-sm mt-1">{book.author}</p>
                  <div className="flex items-center gap-1 mt-2 text-accent-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} className={i < book.rating ? "text-accent-gold fill-accent-gold" : "text-stone-200"} />
                    ))}
                  </div>
                  <div className="mt-auto pt-4 flex justify-between items-center border-t border-stone-100 mt-4">
                    <span className="font-bold text-brand-900 text-lg">{book.price} د.ج</span>
                    <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-1 rounded">{book.category}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <Link 
            to={activeCategory === "الكل" ? "/shop" : `/shop?category=${encodeURIComponent(activeCategory)}`} 
            className="inline-flex items-center gap-2 text-brand-900 border border-brand-900 px-8 py-3.5 rounded font-bold hover:bg-brand-900 hover:text-white transition-all hover:translate-y-[-1px]"
          >
            <span>استكشاف كافة الكتب في المتجر</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* School Books Section */}
      <section className="bg-stone-50 py-16 md:py-24 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-brand-900 rounded-full flex items-center justify-center shadow-lg border border-brand-800">
                <GraduationCap className="text-accent-gold" size={28} />
              </div>
              <div>
                <h2 className="text-3xl font-serif font-bold text-brand-900 mb-1">الكتب المدرسية وحوليات البكالوريا</h2>
                <p className="text-stone-500">مقررات وزارة التربية الوطنية وحوليات البكالوريا المعتمدة بأسعار تنافسية</p>
              </div>
            </div>
            <Link to="/shop?category=كتب مدرسية" className="text-brand-900 font-bold hover:text-accent-gold transition-colors flex items-center gap-2 group self-start md:self-auto">
              <span>تصفح كل الكتب المدرسية</span>
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {schoolBooks.map((book, index) => (
              <motion.div 
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-sm hover:shadow-md border border-stone-200 transition-all group overflow-hidden flex flex-col cursor-pointer"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-stone-100 flex items-center justify-center p-4">
                  <img 
                    src={book.image} 
                    alt={book.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-md"
                  />
                  <div className="absolute top-3 right-3 bg-brand-900 text-accent-gold font-bold text-xs px-3 py-1.5 rounded-full shadow-sm">
                    {book.schoolLevel}
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-serif font-bold text-lg text-brand-900 group-hover:text-accent-gold transition-colors line-clamp-2 mb-2 leading-snug h-12">{book.title}</h3>
                  <p className="text-stone-500 text-sm mb-4">{book.author}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                    <div className="font-bold text-brand-900 text-lg">{book.price} د.ج</div>
                    <button 
                      onClick={(e) => handleAddToCart(e, book)}
                      className="text-xs bg-stone-100 hover:bg-brand-900 text-brand-900 hover:text-white px-4 py-2.5 rounded transition-colors font-bold flex items-center gap-1.5"
                    >
                      <ShoppingCart size={14} />
                      <span>أضف للسلة</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
