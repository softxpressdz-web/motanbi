import { useParams, useNavigate, Link } from "react-router";
import React, { useState, useEffect } from "react";
import { Star, ShoppingCart, Heart, Share2, ShieldCheck, Truck, ArrowRight, CheckCircle2, ChevronLeft, HelpCircle, X, User, Phone, MapPin, Coins, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { ALL_BOOKS, Book } from "../lib/booksData";
import { addToCart } from "../lib/cartStore";
import { toggleWishlist, isInWishlist } from "../lib/wishlistStore";
import { auth } from "../lib/firebase";

const ALGERIAN_WILAYAS = [
  "1- أدرار", "2- الشلف", "3- الأغواط", "4- أم البواقي", "5- باتنة", "6- بجاية", "7- بسكرة", "8- بشار", "9- البليدة", "10- البويرة",
  "11- تمنراست", "12- تبسة", "13- تلمسان", "14- تيارت", "15- تيزي وزو", "16- الجزائر", "17- الجلفة", "18- جيجل", "19- سطيف", "20- سعيدة",
  "21- سكيكدة", "22- سيدي بلعباس", "23- عنابة", "24- قالمة", "25- قسنطينة", "26- المدية", "27- مستغانم", "28- المسيلة", "29- معسكر", "30- ورقلة",
  "31- وهران", "32- البيض", "33- إليزي", "34- برج بوعريريج", "35- بومرداس", "36- الطارف", "37- تندوف", "38- تيسمسيلت", "39- الوادي", "40- خنشلة",
  "41- سوق أهراس", "42- تيبازة", "43- ميلة", "44- عين الدفلى", "45- النعامة", "46- عين تموشنت", "47- غرداية", "48- غليزان",
  "49- تيميمون", "50- برج باجي مختار", "51- أولاد جلال", "52- بني عباس", "53- عين صالح", "54- عين قزام", "55- تقرت", "56- جانت", "57- المغير", "58- المنيعة",
  "59- ولاية مقترحة (59)", "60- ولاية مقترحة (60)", "61- ولاية مقترحة (61)", "62- ولاية مقترحة (62)", "63- ولاية مقترحة (63)", "64- ولاية مقترحة (64)", 
  "65- ولاية مقترحة (65)", "66- ولاية مقترحة (66)", "67- ولاية مقترحة (67)", "68- ولاية مقترحة (68)", "69- ولاية مقترحة (69)"
];

export function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Direct Order Modal State
  const [showDirectOrderModal, setShowDirectOrderModal] = useState(false);
  const [directOrderForm, setDirectOrderForm] = useState({
    fullName: "",
    phone: "",
    wilaya: ALGERIAN_WILAYAS[0],
    address: ""
  });
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [directOrderSuccess, setDirectOrderSuccess] = useState(false);
  const [directCouponCode, setDirectCouponCode] = useState("");
  const [directDiscount, setDirectDiscount] = useState(0);
  const [directCouponError, setDirectCouponError] = useState("");
  const [directCouponSuccess, setDirectCouponSuccess] = useState("");

  // Find current book
  const book = ALL_BOOKS.find(b => b.id === Number(id));

  // Reset quantity and wishlist state on book change
  useEffect(() => {
    setQuantity(1);
    if (book) {
      setIsWishlisted(isInWishlist(book.id));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, book]);

  // Prefill user profile if logged in
  useEffect(() => {
    const fetchUserProfile = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const res = await fetch(`/api/users/profile/${currentUser.uid}`);
          if (res.ok) {
            const result = await res.json();
            const data = result.data || result;
            if (data) {
              setDirectOrderForm(prev => {
                let parsedWilaya = prev.wilaya;
                let parsedAddress = prev.address;
                if (data.address) {
                  const parts = data.address.split(" - ");
                  if (parts.length > 1) {
                    const possibleWilaya = parts[0].trim();
                    const found = ALGERIAN_WILAYAS.find(w => w.includes(possibleWilaya) || possibleWilaya.includes(w));
                    if (found) {
                      parsedWilaya = found;
                    }
                    parsedAddress = parts.slice(1).join(" - ");
                  } else {
                    parsedAddress = data.address;
                  }
                }
                return {
                  fullName: data.name || prev.fullName,
                  phone: data.phone || prev.phone,
                  wilaya: parsedWilaya,
                  address: parsedAddress,
                };
              });
            }
          }
        } catch (e) {
          console.error("Failed to fetch user profile for direct order prefill", e);
        }
      }
    };
    
    fetchUserProfile();
  }, [showDirectOrderModal]);

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">الكتاب غير موجود</h2>
        <p className="text-stone-500 mb-8">عذراً، لم نتمكن من العثور على هذا الكتاب في قاعدة بياناتنا.</p>
        <Link to="/shop" className="bg-brand-900 text-white px-6 py-3 rounded font-bold hover:bg-brand-850">
          العودة إلى المتجر
        </Link>
      </div>
    );
  }

  // Get related books of the same category, excluding the current book
  const relatedBooks = ALL_BOOKS
    .filter(b => b.category === book.category && b.id !== book.id)
    .slice(0, 4);

  const handleIncrement = () => {
    setQuantity(prev => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToCart = () => {
    addToCart(book, quantity);
    setSuccessToast(`تم إضافة ${quantity} من "${book.title}" إلى السلة بنجاح!`);
    setTimeout(() => {
      setSuccessToast(null);
    }, 3000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: book.title,
        text: book.description,
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setSuccessToast("تم نسخ رابط الكتاب لمشاركته مع أصدقائك!");
      setTimeout(() => {
        setSuccessToast(null);
      }, 3000);
    }
  };

  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOrder(true);
    
    // Create the order payload in line with backend requirements
    const newOrder = {
      userId: auth.currentUser?.uid || undefined,
      name: directOrderForm.fullName,
      phone: directOrderForm.phone,
      email: `${directOrderForm.phone}@elmotanaby.com`,
      wilaya: directOrderForm.wilaya,
      address: directOrderForm.address,
      shippingMethod: "home",
      paymentMethod: "COD",
      items: [
        {
          bookId: book?.id,
          quantity: quantity,
          price: book?.price,
        }
      ],
      total: (book?.price || 0) * quantity + 600 - directDiscount, // +600 DA delivery estimate - discount
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOrder),
      });

      if (response.ok) {
        setDirectOrderSuccess(true);
      } else {
        let errMsg = "حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.";
        try {
          const errJson = await response.json();
          if (errJson && errJson.message) {
            errMsg = errJson.message;
          }
        } catch (_) {}
        alert(errMsg);
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ أثناء إرسال الطلب، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-stone-850" dir="rtl">
      
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

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-stone-500 mb-8 font-medium">
        <Link to="/" className="hover:text-brand-900">الرئيسية</Link>
        <ChevronLeft size={12} />
        <Link to="/shop" className="hover:text-brand-900">المتجر</Link>
        <ChevronLeft size={12} />
        <Link to={`/shop?category=${encodeURIComponent(book.category)}`} className="hover:text-brand-900">{book.category}</Link>
        <ChevronLeft size={12} />
        <span className="text-stone-800 font-bold truncate max-w-[200px]">{book.title}</span>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-150 overflow-hidden mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 p-6 md:p-12">
          
          {/* Cover Image */}
          <div className="flex justify-center items-start">
            <div className="w-full max-w-md aspect-[2/3] rounded overflow-hidden shadow-lg border border-stone-100 bg-stone-50">
              <img 
                src={book.image} 
                alt={book.title} 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <span className="inline-block bg-brand-50 text-brand-900 font-bold text-xs px-3 py-1.5 rounded mb-4">
                {book.category}
              </span>
              
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-900 mb-2 leading-tight">
                {book.title}
              </h1>
              
              <p className="text-lg text-stone-500 mb-4 font-semibold">
                تأليف: <span className="text-accent-gold">{book.author}</span>
              </p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1 text-accent-gold">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} fill={j < book.rating ? "currentColor" : "none"} className={j < book.rating ? "text-accent-gold" : "text-stone-200"} />
                  ))}
                  <span className="text-stone-500 text-sm mr-2">(تقييم القراء)</span>
                </div>
                <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">متوفر في الدار</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-brand-900 mb-6">
              {book.price} <span className="text-lg font-serif">د.ج</span>
            </div>

            <div className="border-t border-b border-stone-100 py-6 mb-8">
              <h3 className="font-bold text-brand-900 text-sm mb-3">نبذة عن الكتاب:</h3>
              <p className="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                {book.description}
              </p>
            </div>

            {/* Quantity and Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <div className="flex items-center border border-stone-200 rounded self-start sm:self-auto h-12 bg-stone-50">
                <button 
                  onClick={handleDecrement}
                  className="px-4 py-2 text-stone-500 hover:text-brand-900 font-bold text-lg select-none"
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={quantity} 
                  readOnly 
                  className="w-12 text-center text-brand-900 font-bold focus:outline-none bg-transparent" 
                />
                <button 
                  onClick={handleIncrement}
                  className="px-4 py-2 text-stone-500 hover:text-brand-900 font-bold text-lg select-none"
                >
                  +
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                className="flex-1 h-12 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer border border-stone-200"
              >
                <ShoppingCart size={18} />
                <span>أضف إلى السلة</span>
              </button>

              <button 
                onClick={() => setShowDirectOrderModal(true)}
                className="flex-1 h-12 bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md cursor-pointer"
              >
                <Truck size={18} />
                <span>اشتري الآن</span>
              </button>
              
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => {
                    const added = toggleWishlist(book);
                    setIsWishlisted(added);
                    setSuccessToast(added ? `تم إضافة "${book.title}" إلى المفضلة!` : `تمت إزالة "${book.title}" من المفضلة.`);
                    setTimeout(() => setSuccessToast(null), 3000);
                  }}
                  className={`w-12 h-12 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    isWishlisted 
                      ? "bg-red-50 border-red-200 text-red-500" 
                      : "border-stone-200 text-stone-500 hover:text-red-500 hover:border-red-500"
                  }`}
                  title="أضف للمفضلة"
                >
                  <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>
                
                <button 
                  onClick={handleShare}
                  className="w-12 h-12 rounded border border-stone-200 flex items-center justify-center text-stone-500 hover:text-brand-900 hover:border-brand-900 transition-colors cursor-pointer"
                  title="مشاركة رابط الكتاب"
                >
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            {/* Policies */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600 bg-stone-50 p-4 rounded-lg border border-stone-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-accent-gold">
                  <Truck size={18} />
                </div>
                <div>
                  <p className="font-bold text-brand-900">شحن سريع وموثوق</p>
                  <p className="text-stone-400 mt-0.5">توصيل لكافة ولايات الجزائر والدفع عند الاستلام</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-accent-gold">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <p className="font-bold text-brand-900">دقة ومطابقة تامة</p>
                  <p className="text-stone-400 mt-0.5">الكتب مطبوعة بورق فاخر عالي الجودة وتجليد متين</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Technical details metadata */}
        <div className="bg-stone-50/50 border-t border-stone-150 px-6 py-8 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-stone-400 block mb-1">دار النشر</span>
            <span className="font-bold text-brand-900">دار المتنبي للطباعة والنشر والتوزيع</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">سنة النشر</span>
            <span className="font-bold text-brand-900">{book.year} م</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">عدد الصفحات</span>
            <span className="font-bold text-brand-900">{book.pages} صفحة</span>
          </div>
          <div>
            <span className="text-stone-400 block mb-1">الرقم الدولي (ISBN)</span>
            <span className="font-bold text-brand-900 font-mono text-xs">{book.isbn}</span>
          </div>
        </div>
      </div>

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="mb-12">
          <div className="border-b border-stone-200 pb-4 mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-brand-900">كتب ذات صلة قد تهمك</h2>
            <Link to={`/shop?category=${encodeURIComponent(book.category)}`} className="text-xs text-brand-900 font-bold hover:underline">
              عرض المزيد في هذا القسم
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedBooks.map((relatedBook) => (
              <div 
                key={relatedBook.id}
                onClick={() => navigate(`/book/${relatedBook.id}`)}
                className="group cursor-pointer bg-white rounded-lg border border-stone-200 p-4 hover:shadow-md transition-all flex flex-col h-full"
              >
                <div className="relative aspect-[2/3] mb-3 overflow-hidden rounded bg-stone-50">
                  <img 
                    src={relatedBook.image} 
                    alt={relatedBook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <h3 className="font-bold font-serif text-base text-brand-900 group-hover:text-accent-gold transition-colors line-clamp-1">
                  {relatedBook.title}
                </h3>
                <p className="text-stone-400 text-xs mt-1 mb-2">{relatedBook.author}</p>
                <div className="mt-auto pt-2 border-t border-stone-100 flex justify-between items-center">
                  <span className="font-bold text-brand-900 text-sm">{relatedBook.price} د.ج</span>
                  <span className="text-[10px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">{relatedBook.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Direct Order Modal */}
      <AnimatePresence>
        {showDirectOrderModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDirectOrderModal(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="bg-brand-900 px-6 py-4 flex items-center justify-between text-white shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Truck size={20} className="text-accent-gold" />
                  <span>اشتري الآن</span>
                </h3>
                <button 
                  onClick={() => setShowDirectOrderModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto custom-scrollbar">
                {directOrderSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-brand-900 mb-2">تم استلام طلبك بنجاح!</h3>
                    <p className="text-stone-500 mb-8">سنتواصل معك قريباً لتأكيد تفاصيل الشحن.</p>
                    <button 
                      onClick={() => {
                        setShowDirectOrderModal(false);
                        setDirectOrderSuccess(false);
                      }}
                      className="w-full bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-6 rounded-lg transition-colors cursor-pointer"
                    >
                      متابعة التصفح
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleDirectOrderSubmit} className="space-y-5">
                    {/* Order Summary */}
                    <div className="bg-stone-50 rounded-lg p-4 mb-6 border border-stone-200">
                      <h4 className="font-bold text-brand-900 text-sm mb-3">ملخص الطلب:</h4>
                      <div className="flex items-center gap-4 mb-3">
                        <img src={book.image} alt={book.title} className="w-12 h-16 object-cover rounded shadow-sm" />
                        <div className="flex-1">
                          <p className="font-bold text-stone-800 text-sm line-clamp-1">{book.title}</p>
                          <p className="text-stone-500 text-xs">الكمية: {quantity}</p>
                        </div>
                        <div className="font-bold text-brand-900">{book.price * quantity} د.ج</div>
                      </div>
                      <div className="flex justify-between items-center text-sm pt-3 border-t border-stone-200">
                        <span className="text-stone-600">التوصيل (تقديري):</span>
                        <span className="font-bold text-stone-800">600 د.ج</span>
                      </div>
                      {directDiscount > 0 && (
                        <div className="flex justify-between items-center text-sm pt-2 text-green-600 font-bold">
                          <span>التخفيض (كوبون):</span>
                          <span dir="ltr">-{directDiscount} د.ج</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 mt-2 border-t border-stone-200">
                        <span className="font-bold text-brand-900">المجموع الإجمالي:</span>
                        <span className="font-bold text-brand-900 text-lg">{(book.price * quantity) + 600 - directDiscount} د.ج</span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <User size={16} className="text-stone-400" /> الاسم الكامل
                      </label>
                      <input 
                        type="text" 
                        required
                        value={directOrderForm.fullName}
                        onChange={e => setDirectOrderForm({...directOrderForm, fullName: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Phone size={16} className="text-stone-400" /> رقم الهاتف
                      </label>
                      <input 
                        type="tel" 
                        required
                        dir="ltr"
                        value={directOrderForm.phone}
                        onChange={e => setDirectOrderForm({...directOrderForm, phone: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm text-right"
                        placeholder="05XX XX XX XX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin size={16} className="text-stone-400" /> الولاية
                      </label>
                      <select 
                        required
                        value={directOrderForm.wilaya}
                        onChange={e => setDirectOrderForm({...directOrderForm, wilaya: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-white"
                      >
                        {ALGERIAN_WILAYAS.map(w => (
                          <option key={w} value={w}>{w}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <MapPin size={16} className="text-stone-400" /> العنوان الكامل (البلدية، الحي)
                      </label>
                      <input 
                        type="text" 
                        required
                        value={directOrderForm.address}
                        onChange={e => setDirectOrderForm({...directOrderForm, address: e.target.value})}
                        className="w-full px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm"
                        placeholder="البلدية، الشارع، رقم العمارة..."
                      />
                    </div>

                    {/* Coupon Code Section */}
                    <div>
                      <label className="block text-sm font-bold text-stone-700 mb-1.5 flex items-center gap-1.5">
                        <Coins size={16} className="text-stone-400" /> كوبون التخفيض
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          disabled={isSubmittingOrder || directDiscount > 0}
                          value={directCouponCode}
                          onChange={e => setDirectCouponCode(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-stone-300 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm disabled:bg-stone-50"
                          placeholder="أدخل رمز الكوبون (اختياري)"
                        />
                        <button 
                          type="button"
                          disabled={!directCouponCode || isSubmittingOrder || directDiscount > 0}
                          onClick={() => {
                            const subtotal = book.price * quantity;
                            if (directCouponCode.toUpperCase() === "DISCOUNT10") {
                              setDirectDiscount(subtotal * 0.1);
                              setDirectCouponSuccess("تم تطبيق خصم 10% بنجاح");
                              setDirectCouponError("");
                            } else if (directCouponCode.toUpperCase() === "FREE500") {
                              setDirectDiscount(500);
                              setDirectCouponSuccess("تم تطبيق خصم 500 د.ج بنجاح");
                              setDirectCouponError("");
                            } else {
                              setDirectDiscount(0);
                              setDirectCouponError("كوبون التخفيض غير صالح");
                              setDirectCouponSuccess("");
                            }
                          }}
                          className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-bold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          تطبيق
                        </button>
                      </div>
                      {directCouponError && <p className="text-red-500 text-xs mt-1.5">{directCouponError}</p>}
                      {directCouponSuccess && <p className="text-green-600 text-xs mt-1.5 font-bold">{directCouponSuccess}</p>}
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                      <button 
                        type="submit"
                        disabled={isSubmittingOrder}
                        className="w-full bg-brand-900 hover:bg-brand-850 text-white font-bold py-3.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmittingOrder ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>جاري تأكيد الطلب...</span>
                          </>
                        ) : (
                          <>
                            <Coins size={18} />
                            <span>تأكيد الطلب (الدفع عند الاستلام)</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
