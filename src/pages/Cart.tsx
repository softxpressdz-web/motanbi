import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Trash2, ShoppingBag, ArrowRight, Truck, ClipboardList, CheckCircle, ShieldCheck, Download, Printer } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { getCart, addToCart, updateQuantity, removeFromCart, clearCart, getCartTotal, getCartCount } from "../lib/cartStore";

// Algerian states with custom shipping fees
const ALGERIAN_WILAYAS = [
  { code: "01", name: "1- أدرار", shipping: 600 },
  { code: "02", name: "2- الشلف", shipping: 600 },
  { code: "03", name: "3- الأغواط", shipping: 600 },
  { code: "04", name: "4- أم البواقي", shipping: 600 },
  { code: "05", name: "5- باتنة", shipping: 600 },
  { code: "06", name: "6- بجاية", shipping: 600 },
  { code: "07", name: "7- بسكرة", shipping: 600 },
  { code: "08", name: "8- بشار", shipping: 600 },
  { code: "09", name: "9- البليدة", shipping: 300 },
  { code: "10", name: "10- البويرة", shipping: 600 },
  { code: "11", name: "11- تمنراست", shipping: 600 },
  { code: "12", name: "12- تبسة", shipping: 600 },
  { code: "13", name: "13- تلمسان", shipping: 600 },
  { code: "14", name: "14- تيارت", shipping: 600 },
  { code: "15", name: "15- تيزي وزو", shipping: 600 },
  { code: "16", name: "16- الجزائر", shipping: 400 },
  { code: "17", name: "17- الجلفة", shipping: 600 },
  { code: "18", name: "18- جيجل", shipping: 600 },
  { code: "19", name: "19- سطيف", shipping: 600 },
  { code: "20", name: "20- سعيدة", shipping: 600 },
  { code: "21", name: "21- سكيكدة", shipping: 600 },
  { code: "22", name: "22- سيدي بلعباس", shipping: 600 },
  { code: "23", name: "23- عنابة", shipping: 600 },
  { code: "24", name: "24- قالمة", shipping: 600 },
  { code: "25", name: "25- قسنطينة", shipping: 600 },
  { code: "26", name: "26- المدية", shipping: 600 },
  { code: "27", name: "27- مستغانم", shipping: 600 },
  { code: "28", name: "28- المسيلة", shipping: 600 },
  { code: "29", name: "29- معسكر", shipping: 600 },
  { code: "30", name: "30- ورقلة", shipping: 600 },
  { code: "31", name: "31- وهران", shipping: 600 },
  { code: "32", name: "32- البيض", shipping: 600 },
  { code: "33", name: "33- إليزي", shipping: 600 },
  { code: "34", name: "34- برج بوعريريج", shipping: 600 },
  { code: "35", name: "35- بومرداس", shipping: 600 },
  { code: "36", name: "36- الطارف", shipping: 600 },
  { code: "37", name: "37- تندوف", shipping: 600 },
  { code: "38", name: "38- تيسمسيلت", shipping: 600 },
  { code: "39", name: "39- الوادي", shipping: 600 },
  { code: "40", name: "40- خنشلة", shipping: 600 },
  { code: "41", name: "41- سوق أهراس", shipping: 600 },
  { code: "42", name: "42- تيبازة", shipping: 600 },
  { code: "43", name: "43- ميلة", shipping: 600 },
  { code: "44", name: "44- عين الدفلى", shipping: 600 },
  { code: "45", name: "45- النعامة", shipping: 600 },
  { code: "46", name: "46- عين تموشنت", shipping: 600 },
  { code: "47", name: "47- غرداية", shipping: 600 },
  { code: "48", name: "48- غليزان", shipping: 600 },
  { code: "49", name: "49- تيميمون", shipping: 900 },
  { code: "50", name: "50- برج باجي مختار", shipping: 900 },
  { code: "51", name: "51- أولاد جلال", shipping: 900 },
  { code: "52", name: "52- بني عباس", shipping: 900 },
  { code: "53", name: "53- عين صالح", shipping: 900 },
  { code: "54", name: "54- عين قزام", shipping: 900 },
  { code: "55", name: "55- تقرت", shipping: 900 },
  { code: "56", name: "56- جانت", shipping: 900 },
  { code: "57", name: "57- المغير", shipping: 900 },
  { code: "58", name: "58- المنيعة", shipping: 900 },
  { code: "59", name: "59- ولاية مقترحة (59)", shipping: 900 },
  { code: "60", name: "60- ولاية مقترحة (60)", shipping: 900 },
  { code: "61", name: "61- ولاية مقترحة (61)", shipping: 900 },
  { code: "62", name: "62- ولاية مقترحة (62)", shipping: 900 },
  { code: "63", name: "63- ولاية مقترحة (63)", shipping: 900 },
  { code: "64", name: "64- ولاية مقترحة (64)", shipping: 900 },
  { code: "65", name: "65- ولاية مقترحة (65)", shipping: 900 },
  { code: "66", name: "66- ولاية مقترحة (66)", shipping: 900 },
  { code: "67", name: "67- ولاية مقترحة (67)", shipping: 900 },
  { code: "68", name: "68- ولاية مقترحة (68)", shipping: 900 },
  { code: "69", name: "69- ولاية مقترحة (69)", shipping: 900 }
];

export function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState(getCart());
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [shippingCost, setShippingCost] = useState(0);
  
  // Checkout Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [orderSummary, setOrderSummary] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");

  // Sync cart items on mount and updates
  useEffect(() => {
    const handleCartUpdate = () => {
      setCartItems(getCart());
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, []);

  // Update shipping cost when wilaya changes
  useEffect(() => {
    const wilaya = ALGERIAN_WILAYAS.find(w => w.name === selectedWilaya);
    if (wilaya) {
      setShippingCost(wilaya.shipping);
    } else {
      setShippingCost(0);
    }
  }, [selectedWilaya]);

  const handleQtyChange = (bookId: number, delta: number) => {
    const item = cartItems.find(i => i.book.id === bookId);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        removeFromCart(bookId);
      } else {
        updateQuantity(bookId, newQty);
      }
    }
  };

  const handleRemove = (bookId: number) => {
    removeFromCart(bookId);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage("");

    const subtotal = getCartTotal();
    const finalTotal = subtotal + shippingCost - discount;
    const currentItemsSnapshot = [...cartItems];

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          email: `${phone}@elmotanaby.com`,
          wilaya: selectedWilaya,
          address: notes ? `${address} (${notes})` : address,
          shippingMethod: "home",
          paymentMethod: "COD",
          items: currentItemsSnapshot.map(item => ({
            bookId: item.book.id,
            quantity: item.quantity,
            price: item.book.price,
          })),
          total: finalTotal,
        }),
      });

      if (!response.ok) {
        throw new Error("حدث خطأ في الخادم أثناء تسجيل طلبك. يرجى إعادة المحاولة.");
      }

      const data = await response.json();

      setOrderId(data.orderNumber);
      setOrderSummary({
        id: data.orderNumber,
        fullName,
        phone,
        address: notes ? `${address} (${notes})` : address,
        wilaya: selectedWilaya,
        shippingCost,
        subtotal,
        total: finalTotal,
        items: currentItemsSnapshot,
        date: new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
      });

      setOrderSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشل الاتصال بالخادم لإكمال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = getCartTotal();
  const totalAmount = subtotal + shippingCost - discount;

  if (orderSuccess && orderSummary) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-stone-850" dir="rtl">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg border border-stone-200 shadow-2xl overflow-hidden"
        >
          {/* Header Status */}
          <div className="bg-brand-900 text-white p-8 text-center border-b-4 border-accent-gold">
            <div className="w-16 h-16 bg-accent-gold rounded-full flex items-center justify-center mx-auto mb-4 text-brand-900 shadow-lg">
              <CheckCircle size={36} />
            </div>
            <h1 className="text-2xl font-serif font-bold mb-2">تهانينا! تم تسجيل طلبك بنجاح</h1>
            <p className="text-stone-300 text-sm">شكراً لتسوقك من دار المتنبي. سنتصل بك لتأكيد طلبك الهاتفي قبل الشحن.</p>
          </div>

          {/* Receipt Info */}
          <div className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between border-b border-stone-150 pb-4 text-sm gap-4">
              <div>
                <span className="text-stone-400 block mb-0.5">رقم الطلب</span>
                <span className="font-mono font-bold text-brand-900 text-base">{orderSummary.id}</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-0.5">تاريخ الطلب</span>
                <span className="font-bold text-stone-700">{orderSummary.date}</span>
              </div>
              <div>
                <span className="text-stone-400 block mb-0.5">طريقة الدفع</span>
                <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs">الدفع عند الاستلام (COD)</span>
              </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="font-bold text-brand-900 text-sm mb-3 flex items-center gap-2">
                <ClipboardList size={16} className="text-accent-gold" /> معلومات المستلم والشحن
              </h3>
              <div className="bg-stone-50 rounded p-4 border border-stone-150 text-sm space-y-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <div><span className="text-stone-400">الاسم الكامل:</span> <span className="font-bold text-stone-700">{orderSummary.fullName}</span></div>
                <div><span className="text-stone-400">رقم الهاتف:</span> <span className="font-bold text-stone-700">{orderSummary.phone}</span></div>
                <div><span className="text-stone-400">ولاية الشحن:</span> <span className="font-bold text-stone-700">{orderSummary.wilaya}</span></div>
                <div className="sm:col-span-2 mt-1"><span className="text-stone-400">العنوان الكامل:</span> <span className="font-bold text-stone-700">{orderSummary.address}</span></div>
              </div>
            </div>

            {/* Ordered Books Table */}
            <div>
              <h3 className="font-bold text-brand-900 text-sm mb-3">تفاصيل الكتب المطلوبة</h3>
              <div className="border border-stone-200 rounded overflow-hidden">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold">
                      <th className="p-3">الكتاب</th>
                      <th className="p-3 text-center">الكمية</th>
                      <th className="p-3 text-left">السعر الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-150">
                    {orderSummary.items.map((item: any) => (
                      <tr key={item.book.id}>
                        <td className="p-3">
                          <div className="font-bold text-brand-900">{item.book.title}</div>
                          <div className="text-xs text-stone-400 mt-0.5">{item.book.author}</div>
                        </td>
                        <td className="p-3 text-center font-bold text-stone-600">{item.quantity}</td>
                        <td className="p-3 text-left font-bold text-stone-700">{item.book.price * item.quantity} د.ج</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="bg-stone-50 p-5 rounded border border-stone-150 text-sm space-y-2 max-w-sm mr-auto">
              <div className="flex justify-between">
                <span className="text-stone-500">المجموع الفرعي</span>
                <span className="font-bold text-stone-700">{orderSummary.subtotal} د.ج</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">تكلفة الشحن ({orderSummary.wilaya})</span>
                <span className="font-bold text-stone-700">{orderSummary.shippingCost} د.ج</span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-brand-900">
                <span>المجموع الكلي للمستحق</span>
                <span>{orderSummary.total} د.ج</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 justify-between items-center border-t border-stone-150 pt-6">
              <div className="flex gap-2">
                <button 
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 border border-stone-200 hover:border-brand-900 hover:text-brand-900 text-stone-600 px-4 py-2 rounded text-xs font-bold transition-colors cursor-pointer"
                >
                  <Printer size={14} />
                  <span>طباعة الوصل</span>
                </button>
              </div>
              
              <Link 
                to="/shop" 
                className="bg-brand-900 hover:bg-brand-850 text-white px-6 py-2.5 rounded text-sm font-bold shadow-md transition-colors"
              >
                الاستمرار في التسوق
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 text-stone-850" dir="rtl">
      <div className="flex items-center gap-3 mb-8 border-b border-stone-200 pb-4">
        <h1 className="text-3xl font-serif font-bold text-brand-900">سلة التسوق</h1>
        <span className="text-sm bg-brand-50 text-brand-900 px-2.5 py-1 rounded font-bold">
          {cartItems.length} كتب فريدة
        </span>
      </div>
      
      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white border border-stone-150 rounded-lg shadow-sm">
          <ShoppingBag size={48} className="mx-auto text-stone-300 mb-4" />
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-2">سلتك فارغة تماماً</h2>
          <p className="text-stone-400 text-sm mb-8">لم تقم بإضافة أي كتب إلى السلة حتى الآن.</p>
          <Link to="/shop" className="bg-brand-900 text-white px-8 py-3.5 rounded font-bold hover:bg-brand-850 transition-colors inline-flex items-center gap-2">
            <ArrowRight size={16} />
            <span>تصفح الكتب والمقررات</span>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Cart Items List */}
          <div className="flex-1 space-y-4 w-full">
            <div className="bg-white rounded-lg border border-stone-150 shadow-sm overflow-hidden divide-y divide-stone-100">
              {cartItems.map((item) => (
                <div key={item.book.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-stone-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <img 
                      src={item.book.image} 
                      alt={item.book.title} 
                      className="w-16 h-24 object-cover rounded shadow-sm border border-stone-100 bg-white" 
                    />
                    <div>
                      <h3 className="font-bold text-brand-900 font-serif hover:text-accent-gold transition-colors">
                        <Link to={`/book/${item.book.id}`}>{item.book.title}</Link>
                      </h3>
                      <p className="text-stone-400 text-xs mt-1">المؤلف: {item.book.author}</p>
                      <p className="text-stone-400 text-xs mt-0.5">القسم: {item.book.category}</p>
                      <p className="font-bold text-brand-900 text-sm mt-3">{item.book.price} د.ج</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-4 sm:pt-0">
                    <div className="flex items-center border border-stone-200 rounded bg-stone-50">
                      <button 
                        onClick={() => handleQtyChange(item.book.id, -1)}
                        className="px-3 py-1.5 text-stone-500 hover:text-brand-900 font-bold select-none text-base"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-brand-900 font-bold text-sm">{item.quantity}</span>
                      <button 
                        onClick={() => handleQtyChange(item.book.id, 1)}
                        className="px-3 py-1.5 text-stone-500 hover:text-brand-900 font-bold select-none text-base"
                      >
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => handleRemove(item.book.id)}
                      className="text-stone-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded transition-colors cursor-pointer"
                      title="حذف من السلة"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <Link to="/shop" className="text-brand-900 hover:text-accent-gold font-bold flex items-center gap-1">
                <ArrowRight size={16} />
                <span>العودة للمتجر لإضافة المزيد</span>
              </Link>
              <button 
                onClick={() => { clearCart(); }}
                className="text-red-500 hover:underline font-bold"
              >
                تفريغ السلة بالكامل
              </button>
            </div>
          </div>

          {/* Checkout & Delivery Form */}
          <div className="w-full lg:w-[400px] shrink-0 bg-white rounded-lg border border-stone-150 p-6 shadow-md">
            <h3 className="font-bold text-brand-900 text-base mb-4 border-b border-stone-150 pb-2.5">
              تفاصيل الشحن وإتمام الطلب
            </h3>
            
            <form onSubmit={handleCheckoutSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                  <ShieldCheck className="text-red-600 shrink-0" size={16} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">الاسم الكامل للمستلم *</label>
                <input 
                  type="text" 
                  required
                  disabled={isSubmitting}
                  placeholder="الاسم الثلاثي أو الكامل"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">رقم الهاتف *</label>
                <input 
                  type="tel" 
                  required
                  disabled={isSubmitting}
                  placeholder="مثال: 0660000000"
                  pattern="^0[5-7][0-9]{8}$"
                  title="يرجى إدخال رقم هاتف جزائري صحيح يتكون من 10 أرقام ويبدأ بـ 05 أو 06 أو 07"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold text-right disabled:opacity-60"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">الولاية (سعر شحن مخصص) *</label>
                <select 
                  required
                  disabled={isSubmitting}
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold cursor-pointer disabled:opacity-60"
                >
                  <option value="">اختر ولاية الشحن...</option>
                  {ALGERIAN_WILAYAS.map(w => (
                    <option key={w.code} value={w.name}>{w.name} (+{w.shipping} د.ج شحن)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">العنوان الكامل بالتفصيل *</label>
                <textarea 
                  required
                  disabled={isSubmitting}
                  rows={2}
                  placeholder="الحي، اسم الشارع، رقم المنزل، المدينة"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-1">ملاحظات إضافية (اختياري)</label>
                <input 
                  type="text" 
                  disabled={isSubmitting}
                  placeholder="ساعات التوصيل المفضلة، أي تعليمات أخرى"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                />
              </div>

              {/* Coupon Code Section */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-stone-500 mb-1">كوبون التخفيض</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    disabled={isSubmitting || discount > 0}
                    placeholder="أدخل رمز الكوبون (اختياري)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                  />
                  <button 
                    type="button"
                    disabled={!couponCode || isSubmitting || discount > 0}
                    onClick={() => {
                      if (couponCode.toUpperCase() === "DISCOUNT10") {
                        setDiscount(subtotal * 0.1);
                        setCouponSuccess("تم تطبيق خصم 10% بنجاح");
                        setCouponError("");
                      } else if (couponCode.toUpperCase() === "FREE500") {
                        setDiscount(500);
                        setCouponSuccess("تم تطبيق خصم 500 د.ج بنجاح");
                        setCouponError("");
                      } else {
                        setDiscount(0);
                        setCouponError("كوبون التخفيض غير صالح");
                        setCouponSuccess("");
                      }
                    }}
                    className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 text-sm font-bold rounded disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    تطبيق
                  </button>
                </div>
                {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                {couponSuccess && <p className="text-green-600 text-xs mt-1 font-bold">{couponSuccess}</p>}
              </div>

              {/* Order breakdown */}
              <div className="bg-stone-50 p-4 rounded border border-stone-150 text-xs space-y-2 mt-6">
                <div className="flex justify-between text-stone-500">
                  <span>المجموع الفرعي للكتب</span>
                  <span className="font-bold">{subtotal} د.ج</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>تكلفة التوصيل للولاية</span>
                  <span className="font-bold">{selectedWilaya ? `${shippingCost} د.ج` : "بانتظار اختيار الولاية"}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold border-t border-stone-200 pt-2 mt-2">
                    <span>التخفيض (كوبون)</span>
                    <span dir="ltr">-{discount} د.ج</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-brand-900 mt-2">
                  <span>المجموع الكلي المطلوب</span>
                  <span>{totalAmount} د.ج</span>
                </div>
              </div>

              <button 
                type="submit"
                disabled={cartItems.length === 0 || isSubmitting}
                className="w-full bg-accent-gold hover:bg-accent-gold-hover disabled:bg-stone-200 disabled:text-stone-400 text-brand-900 font-bold py-3.5 rounded flex items-center justify-center gap-2 shadow-md transition-colors mt-4 cursor-pointer disabled:cursor-not-allowed"
              >
                <ShieldCheck size={18} className={isSubmitting ? "animate-pulse" : ""} />
                <span>{isSubmitting ? "جاري إرسال وتأكيد الطلب..." : "تأكيد الطلب وشحن الكتب"}</span>
              </button>

              <p className="text-[10px] text-stone-400 text-center leading-normal">
                بطلبك من دار المتنبي، أنت توافق على شروط الخدمة. الدفع سيكون نقداً لشركة التوصيل عند استلام الكتب وباب منزلك.
              </p>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}
