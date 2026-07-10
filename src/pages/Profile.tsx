import React, { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2, 
  ShoppingBag, Heart, FileText, ChevronDown, ChevronUp, 
  BookOpen, Clock, Trash2, ShoppingCart, ArrowRight 
} from "lucide-react";
import { Link } from "react-router";
import { getWishlist, removeFromWishlist } from "../lib/wishlistStore";
import { addToCart } from "../lib/cartStore";
import { Book } from "../lib/booksData";

interface ProfileProps {
  user: FirebaseUser | null;
  dbUser: any;
}

type TabType = "personal" | "orders" | "wishlist" | "publications";

export function Profile({ user, dbUser }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<TabType>("personal");
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  // Wishlist State
  const [wishlist, setWishlist] = useState<Book[]>([]);

  // Manuscripts State
  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [isLoadingManuscripts, setIsLoadingManuscripts] = useState(false);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || "",
        phone: dbUser.phone || "",
        address: dbUser.address || ""
      });
    }
  }, [dbUser]);

  // Load Wishlist
  const loadWishlist = () => {
    setWishlist(getWishlist());
  };

  useEffect(() => {
    loadWishlist();
    // Listen for custom wishlist updates
    const handleWishlistUpdate = () => {
      loadWishlist();
    };
    window.addEventListener("wishlist-updated", handleWishlistUpdate);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, []);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!user) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders/user/${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        // The API returns { status: "success", data: [...] } or direct list
        setOrders(data.data || data);
      }
    } catch (e) {
      console.error("Failed to fetch user orders", e);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Fetch Manuscripts / Submissions
  const fetchManuscripts = async () => {
    if (!user || !user.email) return;
    setIsLoadingManuscripts(true);
    try {
      const res = await fetch("/api/manuscripts");
      if (res.ok) {
        const data = await res.json();
        const list = data.data || data;
        // Filter by user's email
        const userMail = user.email.toLowerCase().trim();
        const filtered = list.filter((item: any) => item.email && item.email.toLowerCase().trim() === userMail);
        setManuscripts(filtered);
      }
    } catch (e) {
      console.error("Failed to fetch manuscripts", e);
    } finally {
      setIsLoadingManuscripts(false);
    }
  };

  // Fetch data depending on tab
  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "publications") {
      fetchManuscripts();
    }
  }, [activeTab, user]);

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    try {
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          uid: user.uid,
          name: formData.name,
          phone: formData.phone,
          address: formData.address
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccessMessage("تم تحديث معلومات الملف الشخصي بنجاح.");
        // Sync user details locally too
        if (window.dispatchEvent) {
          window.dispatchEvent(new Event("profile-updated"));
        }
      } else {
        setErrorMessage(data.message || "حدث خطأ أثناء تحديث المعلومات.");
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveFromWishlist = (bookId: number) => {
    removeFromWishlist(bookId);
    setWishlist(prev => prev.filter(item => item.id !== bookId));
    triggerToast("تمت إزالة الكتاب من المفضلة.");
  };

  const handleAddToCartFromWishlist = (book: Book) => {
    addToCart(book, 1);
    triggerToast(`تم إضافة "${book.title}" إلى سلة التسوق بنجاح!`);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Translation helpers for statuses
  const getOrderStatusLabel = (status: string) => {
    switch (status) {
      case "processing": return { label: "قيد المعالجة", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "shipped": return { label: "تم الشحن", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "completed": return { label: "تم التوصيل", color: "bg-green-50 text-green-700 border-green-200" };
      case "cancelled": return { label: "ملغي", color: "bg-red-50 text-red-700 border-red-200" };
      default: return { label: status, color: "bg-stone-50 text-stone-700 border-stone-200" };
    }
  };

  const getSubmissionStatusLabel = (status: string) => {
    switch (status) {
      case "submitted": return { label: "تم استلام الطلب", color: "bg-stone-100 text-stone-700" };
      case "contract_signed": return { label: "العقد موقع إلكترونياً", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case "in_review": return { label: "قيد المراجعة العلمية", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "accepted": return { label: "مقبول للطباعة", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "printed": return { label: "تمت الطباعة والنشر", color: "bg-purple-50 text-purple-700 border-purple-200" };
      default: return { label: status, color: "bg-stone-50 text-stone-700" };
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center" dir="rtl">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">يرجى تسجيل الدخول أولاً</h2>
        <p className="text-stone-500 mb-8">تحتاج إلى تسجيل الدخول للوصول إلى لوحة التحكم وحسابك الشخصي.</p>
        <Link to="/" className="inline-block bg-brand-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-brand-850 shadow-md">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-stone-850 relative" dir="rtl">
      
      {/* Dynamic Toast Feedback */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "50%" }}
            animate={{ opacity: 1, y: 0, x: "50%" }}
            exit={{ opacity: 0, y: 20, x: "50%" }}
            className="fixed bottom-24 right-1/2 translate-x-1/2 bg-brand-900 text-white px-6 py-3.5 rounded-lg shadow-2xl border-r-[4px] border-accent-gold z-50 flex items-center gap-3 text-sm font-semibold min-w-[300px]"
          >
            <CheckCircle2 className="text-accent-gold shrink-0" size={20} />
            <span className="flex-1 text-right">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl border border-stone-150 p-6 shadow-sm sticky top-28 space-y-6">
            
            {/* User Info Header */}
            <div className="text-center pb-6 border-b border-stone-150">
              <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-stone-100 shadow-inner">
                <User size={36} className="text-brand-900" />
              </div>
              <h2 className="text-lg font-bold font-serif text-brand-900">{formData.name || user.email?.split("@")[0]}</h2>
              <p className="text-xs text-stone-500 mt-1 truncate max-w-full font-mono">{user.email}</p>
              {dbUser?.role === "admin" && (
                <span className="inline-block text-[10px] bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 rounded-full mt-2">
                  مدير المنصة
                </span>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => setActiveTab("personal")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === "personal" 
                    ? "bg-brand-900 text-white shadow-md" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-brand-900"
                }`}
              >
                <User size={18} />
                <span>معلوماتي الشخصية</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === "orders" 
                    ? "bg-brand-900 text-white shadow-md" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-brand-900"
                }`}
              >
                <ShoppingBag size={18} />
                <span>مشترياتي وطلباتي</span>
                {orders.length > 0 && (
                  <span className={`mr-auto text-xs px-2 py-0.5 rounded-full ${activeTab === "orders" ? "bg-white text-brand-900" : "bg-stone-100 text-stone-600"}`}>
                    {orders.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === "wishlist" 
                    ? "bg-brand-900 text-white shadow-md" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-brand-900"
                }`}
              >
                <Heart size={18} />
                <span>قائمتي المفضلة</span>
                {wishlist.length > 0 && (
                  <span className={`mr-auto text-xs px-2 py-0.5 rounded-full ${activeTab === "wishlist" ? "bg-white text-brand-900" : "bg-stone-100 text-stone-600"}`}>
                    {wishlist.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("publications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-right cursor-pointer ${
                  activeTab === "publications" 
                    ? "bg-brand-900 text-white shadow-md" 
                    : "text-stone-600 hover:bg-stone-50 hover:text-brand-900"
                }`}
              >
                <FileText size={18} />
                <span>عقود النشر والمؤلفات</span>
                {manuscripts.length > 0 && (
                  <span className={`mr-auto text-xs px-2 py-0.5 rounded-full ${activeTab === "publications" ? "bg-white text-brand-900" : "bg-stone-100 text-stone-600"}`}>
                    {manuscripts.length}
                  </span>
                )}
              </button>
            </nav>

            {/* Quick Actions for admin */}
            {dbUser?.role === "admin" && (
              <div className="pt-4 border-t border-stone-150">
                <Link 
                  to="/admin" 
                  className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2.5 px-4 rounded-lg transition-colors text-center"
                >
                  <span>لوحة تحكم الإدارة</span>
                  <ArrowRight size={14} className="rotate-180" />
                </Link>
              </div>
            )}

          </div>
        </aside>

        {/* Dynamic Content Panel */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl border border-stone-150 p-6 md:p-8 shadow-sm min-h-[500px]">
            
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Personal Info */}
              {activeTab === "personal" && (
                <motion.div
                  key="personal"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-stone-150 pb-4">
                    <h3 className="text-xl font-bold font-serif text-brand-900">المعلومات الشخصية وعناوين الشحن</h3>
                    <p className="text-xs text-stone-500 mt-1">تعديل بياناتك المسجلة لتسهيل عملية إيصال الكتب والمشتريات وتوقيع العقود.</p>
                  </div>

                  <form onSubmit={handleSubmitProfile} className="space-y-6">
                    {successMessage && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold">
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                        <span>{successMessage}</span>
                      </div>
                    )}
                    
                    {errorMessage && (
                      <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm font-semibold">
                        {errorMessage}
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                          <User size={15} className="text-stone-400" /> الاسم الكامل
                        </label>
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50"
                          placeholder="أدخل اسمك الكامل الثلاثي"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                          <Mail size={15} className="text-stone-400" /> البريد الإلكتروني
                        </label>
                        <input 
                          type="email" 
                          value={user.email || ""}
                          disabled
                          className="w-full px-4 py-3 rounded-lg border border-stone-200 text-sm bg-stone-100 text-stone-500 cursor-not-allowed font-mono"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                          <Phone size={15} className="text-stone-400" /> رقم الهاتف النشط
                        </label>
                        <input 
                          type="tel" 
                          value={formData.phone}
                          onChange={e => setFormData({...formData, phone: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50 text-right"
                          placeholder="مثال: 0550 12 34 56"
                          dir="ltr"
                        />
                        <p className="text-[10px] text-stone-500">رقم الهاتف مهم لتأكيد الطلبيات هاتفياً من قبل إدارة التوصيل.</p>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                          <MapPin size={15} className="text-stone-400" /> عنوان الإقامة والشحن بالتفصيل
                        </label>
                        <textarea 
                          value={formData.address}
                          onChange={e => setFormData({...formData, address: e.target.value})}
                          className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50 min-h-[110px]"
                          placeholder="الولاية، البلدية، اسم الحي أو الشارع، رقم المنزل والمعالم القريبة..."
                        />
                        <p className="text-[10px] text-stone-500">يرجى كتابة العنوان بدقة متناهية لضمان وصول موظف التوصيل لباب منزلك دون تأخير.</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-100 flex justify-end">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed text-sm shadow-md"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            <span>جاري حفظ البيانات...</span>
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            <span>حفظ التعديلات</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Tab 2: Purchases & Orders */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-stone-150 pb-4">
                    <h3 className="text-xl font-bold font-serif text-brand-900">سجل مشترياتي وطلباتي</h3>
                    <p className="text-xs text-stone-500 mt-1">متابعة شحن طلبيات الكتب السابقة ومعلومات الدفع عند الاستلام بالتفصيل.</p>
                  </div>

                  {isLoadingOrders ? (
                    <div className="py-20 text-center">
                      <Loader2 size={36} className="animate-spin text-brand-900 mx-auto mb-4" />
                      <p className="text-stone-500 text-sm">جاري جلب سجل الطلبيات المودعة...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                        <ShoppingBag size={28} />
                      </div>
                      <h4 className="text-base font-bold text-stone-700">لا توجد طلبيات مسجلة بعد</h4>
                      <p className="text-xs text-stone-500 mt-1 mb-6">لم تقم بإجراء أي عمليات شراء عبر حسابك حتى الآن.</p>
                      <Link to="/shop" className="bg-brand-900 text-white hover:bg-brand-850 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors inline-block">
                        تصفح الكتب واشترِ الآن
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => {
                        const isExpanded = expandedOrder === order.id;
                        const statusInfo = getOrderStatusLabel(order.status);
                        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString("ar-DZ", {
                          year: "numeric", month: "long", day: "numeric"
                        }) : "غير متوفر";

                        return (
                          <div 
                            key={order.id} 
                            className="border border-stone-150 rounded-xl overflow-hidden bg-white shadow-sm hover:border-stone-200 transition-all"
                          >
                            {/* Order Summary Header */}
                            <div 
                              onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                              className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer bg-stone-50 hover:bg-stone-50/70 select-none"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-brand-900 shrink-0">
                                  <ShoppingBag size={18} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm text-brand-900 font-mono">{order.orderNumber}</span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.color}`}>
                                      {statusInfo.label}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                                    <Clock size={12} />
                                    <span>طلب في {orderDate}</span>
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-6">
                                <div className="text-left">
                                  <p className="text-xs text-stone-500">الإجمالي الكلي</p>
                                  <p className="text-sm font-black text-brand-900 mt-0.5">{parseFloat(order.total).toLocaleString()} د.ج</p>
                                </div>
                                <div className="text-stone-400">
                                  {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                </div>
                              </div>
                            </div>

                            {/* Order Details Accordion */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t border-stone-150"
                                >
                                  <OrderDetailsLoader orderId={order.id} />
                                  
                                  {/* Extra Shipping info */}
                                  <div className="bg-stone-50 p-4 border-t border-stone-150 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-stone-600">
                                    <div>
                                      <p className="font-bold text-brand-900">طريقة الدفع:</p>
                                      <p className="mt-1">{order.paymentMethod === "COD" ? "الدفع نقداً عند الاستلام" : order.paymentMethod}</p>
                                    </div>
                                    <div>
                                      <p className="font-bold text-brand-900">طريقة التوصيل:</p>
                                      <p className="mt-1">{order.shippingMethod === "home" ? "توصيل للمنزل عبر مكاتب الشحن" : "توصيل للمكتبة أو نقطة استلام"}</p>
                                    </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 3: Wishlist / Favorites */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-stone-150 pb-4">
                    <h3 className="text-xl font-bold font-serif text-brand-900">قائمتي المفضلة</h3>
                    <p className="text-xs text-stone-500 mt-1">الكتب والمؤلفات التي قمت بحفظها للرجوع إليها أو لشرائها لاحقاً بسهولة.</p>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="py-16 text-center">
                      <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                        <Heart size={28} />
                      </div>
                      <h4 className="text-base font-bold text-stone-700">المفضلة فارغة</h4>
                      <p className="text-xs text-stone-500 mt-1 mb-6">لم تقم بإضافة أي كتاب إلى قائمة رغباتك ومفضلتك حتى الآن.</p>
                      <Link to="/shop" className="bg-brand-900 text-white hover:bg-brand-850 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors inline-block">
                        تصفح المعرض وأضف كتبك المفضلة
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlist.map((book) => (
                        <div 
                          key={book.id} 
                          className="flex gap-4 p-4 rounded-xl border border-stone-150 bg-white hover:border-stone-200 transition-all items-center"
                        >
                          {/* Book cover thumbnail */}
                          <Link to={`/book/${book.id}`} className="w-16 h-20 bg-stone-50 rounded overflow-hidden flex items-center justify-center border border-stone-100 p-1 shrink-0">
                            <img 
                              src={book.image} 
                              alt={book.title} 
                              className="w-full h-full object-contain"
                              onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x120?text=No+Cover'; }}
                            />
                          </Link>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <Link to={`/book/${book.id}`} className="block">
                              <h4 className="font-bold text-sm text-brand-900 truncate hover:underline">{book.title}</h4>
                            </Link>
                            <p className="text-[11px] text-stone-500 mt-1 truncate">{book.author}</p>
                            <p className="text-xs font-black text-brand-900 mt-1.5">{book.price} د.ج</p>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-col gap-2 shrink-0">
                            <button
                              onClick={() => handleAddToCartFromWishlist(book)}
                              className="p-2 bg-stone-50 hover:bg-brand-900 hover:text-white border border-stone-200 rounded-lg text-stone-600 transition-all cursor-pointer flex items-center justify-center"
                              title="أضف إلى السلة"
                            >
                              <ShoppingCart size={16} />
                            </button>
                            <button
                              onClick={() => handleRemoveFromWishlist(book.id)}
                              className="p-2 bg-red-50 hover:bg-red-500 hover:text-white border border-red-100 rounded-lg text-red-500 transition-all cursor-pointer flex items-center justify-center"
                              title="إزالة من المفضلة"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 4: Publications / Contracts */}
              {activeTab === "publications" && (
                <motion.div
                  key="publications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="border-b border-stone-150 pb-4">
                    <h3 className="text-xl font-bold font-serif text-brand-900">مخطوطاتي وعقود الطباعة والنشر</h3>
                    <p className="text-xs text-stone-500 mt-1">متابعة المخطوطات التي قمت بتقديمها للدار، تفاصيل تكاليف الطباعة، ونسب الأرباح وحالة النشر.</p>
                  </div>

                  {isLoadingManuscripts ? (
                    <div className="py-20 text-center">
                      <Loader2 size={36} className="animate-spin text-brand-900 mx-auto mb-4" />
                      <p className="text-stone-500 text-sm">جاري جلب عقود المخطوطات والاتفاقيات...</p>
                    </div>
                  ) : manuscripts.length === 0 ? (
                    <div className="py-16 text-center text-stone-800">
                      <div className="w-16 h-16 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
                        <FileText size={28} />
                      </div>
                      <h4 className="text-base font-bold text-stone-700">هل أنت كاتب أو مؤلف؟</h4>
                      <p className="text-xs text-stone-500 mt-1 mb-6">لم تقم بإرسال أي مخطوطة أو طلب تعاقد مع دار المتنبي باسم هذا الحساب.</p>
                      <Link to="/publish-book" className="bg-brand-900 text-white hover:bg-brand-850 px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-colors inline-block">
                        احسب تكاليف كتابك وانشره معنا
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {manuscripts.map((item) => {
                        const statusObj = getSubmissionStatusLabel(item.status);
                        const dateText = item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-DZ") : "غير متوفر";

                        return (
                          <div 
                            key={item.id} 
                            className="p-5 border border-stone-150 rounded-xl bg-white shadow-sm space-y-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-brand-50 text-brand-900 rounded-full flex items-center justify-center shrink-0">
                                  <BookOpen size={18} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-brand-900">{item.bookTitle}</h4>
                                  <p className="text-xs text-stone-500 mt-0.5">قسم: {item.bookCategory} | تقديم بتاريخ: {dateText}</p>
                                </div>
                              </div>
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusObj.color || "bg-stone-50 text-stone-700"}`}>
                                {statusObj.label}
                              </span>
                            </div>

                            <div className="bg-stone-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                              <div className="space-y-0.5 border-l border-stone-200 last:border-l-0">
                                <p className="text-[10px] text-stone-500">عدد الصفحات</p>
                                <p className="text-xs font-bold text-stone-800">{item.pageCount} صفحة</p>
                              </div>
                              <div className="space-y-0.5 border-l border-stone-200 last:border-l-0">
                                <p className="text-[10px] text-stone-500">نسخ الطبعة</p>
                                <p className="text-xs font-bold text-stone-800">{item.printCopies} نسخة</p>
                              </div>
                              <div className="space-y-0.5 border-l border-stone-200 last:border-l-0">
                                <p className="text-[10px] text-stone-500">ربحك للمبيعة (حقوقك)</p>
                                <p className="text-xs font-bold text-accent-gold font-black">{parseFloat(item.royaltyPerSale || "0").toLocaleString()} د.ج</p>
                              </div>
                              <div className="space-y-0.5 last:border-l-0">
                                <p className="text-[10px] text-stone-500">سعر البيع المقترح</p>
                                <p className="text-xs font-bold text-brand-900">{parseFloat(item.retailPrice || "0").toLocaleString()} د.ج</p>
                              </div>
                            </div>

                            {/* Detailed contract information if accepted/signed */}
                            {item.status === "contract_signed" && (
                              <div className="text-xs text-stone-600 bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                <p className="font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 size={14} className="text-emerald-600" />
                                  <span>اتفاقية النشر الافتراضية سارية العمل</span>
                                </p>
                                <p className="mt-1 leading-relaxed">
                                  تم توقيع العقد قانونياً بواسطة المؤلف <strong className="text-stone-800">{item.signatureName}</strong>. 
                                  النسخة المرسلة للمخطوطة (<code className="text-stone-700 font-mono text-[10px] bg-white px-1 border rounded">{item.uploadedFileName}</code>) تم إحالتها للتدقيق والمطابقة. سنتواصل معك هاتفياً على الرقم <strong className="text-stone-800 font-mono">{item.phone}</strong> فور الانتهاء.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </main>

      </div>
    </div>
  );
}

// Inner helper component to load items asynchronously
function OrderDetailsLoader({ orderId }: { orderId: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setItems(data.data?.items || data.items || []);
        }
      } catch (e) {
        console.error("Failed to load order items details", e);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <Loader2 size={16} className="animate-spin text-brand-900 mx-auto" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3 bg-white">
      <p className="text-xs font-bold text-brand-900 border-b border-stone-100 pb-1.5 mb-2">تفاصيل محتويات الطلب:</p>
      {items.map((item, idx) => (
        <div key={idx} className="flex justify-between items-center text-xs gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-10 bg-stone-50 rounded border border-stone-100 flex items-center justify-center p-0.5 shrink-0">
              <img 
                src={item.book?.coverImage || item.book?.image} 
                alt={item.book?.title} 
                className="w-full h-full object-contain"
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/80x100?text=Cover'; }}
              />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-stone-800 block truncate">{item.book?.title || "كتاب غير معروف"}</span>
              <span className="text-stone-500 block text-[10px] mt-0.5">الكمية: {item.quantity} × {parseFloat(item.priceAtPurchase || item.price || "0").toLocaleString()} د.ج</span>
            </div>
          </div>
          <span className="font-bold text-brand-900 text-left shrink-0">
            {(item.quantity * parseFloat(item.priceAtPurchase || item.price || "0")).toLocaleString()} د.ج
          </span>
        </div>
      ))}
    </div>
  );
}
