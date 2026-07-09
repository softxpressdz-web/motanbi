import React, { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import { 
  Search, ShoppingBag, User, Menu, Facebook, Linkedin, Twitter, 
  ChevronDown, ChevronLeft, MessageSquare, Send, X, Bot, HelpCircle,
  AlertCircle, ExternalLink, ShieldAlert
} from "lucide-react";
import { auth, googleAuthProvider } from "../lib/firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { getCartCount } from "../lib/cartStore";

export function Layout({ children, user, dbUser }: { children: ReactNode; user: any; dbUser: any }) {
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Support Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string; time: string }>>([
    {
      sender: "bot",
      text: "مرحباً بك في دار المتنبي للطباعة والنشر! أنا المساعد الذكي لمساندتك والإجابة على أي استفسارات حول الكتب، الأسعار، أو كيفية نشر مؤلفاتك معنا. كيف يمكنني مساعدتك اليوم؟",
      time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  
  // Iframe Popup Login Mitigation States
  const [showIframeLoginModal, setShowIframeLoginModal] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sync cart counter
  useEffect(() => {
    setCartCount(getCartCount());

    const handleCartUpdate = () => {
      setCartCount(getCartCount());
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    
    // Listen for custom open chat event
    const handleOpenChat = () => {
      setIsChatOpen(true);
    };
    window.addEventListener("open-live-chat", handleOpenChat);

    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("open-live-chat", handleOpenChat);
    };
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, isChatOpen]);

  const executeSignIn = async () => {
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      setShowIframeLoginModal(false);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/popup-blocked" ||
        err.message?.includes("Pending promise was never set") ||
        err.message?.includes("cancelled-popup")
      ) {
        setLoginError("تم حظر نافذة تسجيل الدخول المنبثقة من قبل المتصفح أو إطار الحماية. يرجى فتح الموقع في نافذة جديدة للتسجيل بأمان.");
        setShowIframeLoginModal(true);
      } else {
        setLoginError(err.message || "فشل تسجيل الدخول. يرجى تكرار المحاولة.");
      }
    }
  };

  const handleLogin = async () => {
    if (user) {
      await signOut(auth);
    } else {
      // Detect if we are inside an iframe
      const isIframe = window.self !== window.top;
      
      if (isIframe) {
        setShowIframeLoginModal(true);
        return;
      }

      await executeSignIn();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Send message to backend support chat
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userText = userInput.trim();
    const currentTime = new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
    
    setChatMessages((prev) => [...prev, { sender: "user", text: userText, time: currentTime }]);
    setUserInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/support-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history: chatMessages }),
      });
      const data = await response.json();
      
      setChatMessages((prev) => [
        ...prev, 
        { 
          sender: "bot", 
          text: data.reply || "مرحباً بك! كيف يمكنني مساعدتك اليوم؟", 
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" }) 
        }
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setChatMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "عذراً، حدث خطأ أثناء الاتصال بالخادم. يرجى تكرار المحاولة لاحقاً.",
          time: new Date().toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const sendQuickReply = (question: string) => {
    setUserInput(question);
    setTimeout(() => {
      // Simulate click submit
      const inputForm = document.getElementById("chat-form") as HTMLFormElement | null;
      if (inputForm) {
        inputForm.requestSubmit();
      }
    }, 50);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800" dir="rtl">
      {/* Top Bar */}
      <div className="bg-brand-900 border-b border-brand-800 text-stone-300">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex justify-between items-center text-xs">
          <div className="flex gap-4 items-center">
            <Link to="/about-publishing" className="hover:text-accent-gold transition-colors">سياسة النشر</Link>
            <span className="text-stone-700">|</span>
            <Link to="/publish-book" className="hover:text-accent-gold transition-colors">أنشر كتاب</Link>
            <span className="text-stone-700">|</span>
            <Link to="/offers" className="hover:text-accent-gold transition-colors font-bold text-accent-gold">تخفيضات</Link>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span>الهاتف: +213 660 00 00 00</span>
            <span className="text-stone-700">|</span>
            <span>الجزائر العاصمة</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-14 h-14 flex items-center justify-center overflow-hidden bg-stone-50 rounded-sm border border-stone-100 p-1">
              <img 
                src="/logo.png" 
                alt="دار المتنبي للطباعة والنشر" 
                className="w-full h-full object-contain" 
                onError={(e) => { e.currentTarget.src = 'https://placehold.co/150x150/fcfbf9/1a233a?text=Logo'; }} 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-2xl text-brand-900 leading-none tracking-tight">دار المتنبي</span>
              <span className="font-serif text-[10px] text-stone-500 font-bold tracking-widest mt-1">للطباعة والنشر والتوزيع</span>
            </div>
          </Link>

          {/* Search Bar Form */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن كتاب، مؤلف، تصنيف..."
              className="w-full pl-4 pr-12 py-2.5 bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all text-sm text-stone-800"
            />
            <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-accent-gold transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 text-stone-600 hover:text-brand-900 transition-colors" title="الملف الشخصي">
                  <User size={22} className="text-stone-500 hover:text-brand-900" />
                  <span className="hidden sm:inline font-medium text-sm">حسابي</span>
                </Link>
                <button onClick={handleLogin} className="flex items-center gap-2 text-stone-600 hover:text-brand-900 transition-colors" title="تسجيل الخروج">
                  <span className="hidden sm:inline font-medium text-sm text-red-600 hover:text-red-700">خروج</span>
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 text-stone-600 hover:text-brand-900 transition-colors">
                <User size={22} className="text-stone-500 hover:text-brand-900" />
                <span className="hidden sm:inline font-medium text-sm">دخول</span>
              </button>
            )}
            
            <Link to="/cart" className="flex items-center gap-2 text-stone-600 hover:text-brand-900 transition-colors relative">
              <ShoppingBag size={22} className="text-stone-500" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-accent-gold text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden text-stone-600 hover:text-brand-900">
              <Menu size={24} />
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="border-t border-stone-100 hidden md:block bg-brand-900 text-stone-100 shadow-md">
          <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
            <ul className="flex items-center gap-8 text-sm font-medium py-3 z-50">
              <li><Link to="/" className="hover:text-accent-gold transition-colors">الرئيسية</Link></li>
              <li className="group relative">
                <Link to="/shop" className="flex items-center gap-1 hover:text-accent-gold transition-colors py-2">
                  الكتب <ChevronDown size={14} />
                </Link>
                <div className="absolute top-full right-0 w-60 bg-white text-stone-800 shadow-xl rounded border border-stone-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="group/univ relative">
                    <div className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 hover:text-brand-900 transition-colors cursor-pointer text-right text-sm">
                      <span className="font-semibold">كتب جامعية وأكاديمية</span>
                      <ChevronLeft size={14} />
                    </div>
                    <div className="absolute top-0 right-full w-56 bg-white text-stone-800 shadow-xl rounded border border-stone-100 py-2 opacity-0 invisible group-hover/univ:opacity-100 group-hover/univ:visible transition-all duration-200 z-50 max-h-[70vh] overflow-y-auto hide-scrollbar">
                      <Link to="/shop?category=كتب الاقتصاد" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب الاقتصاد</Link>
                      <Link to="/shop?category=كتب التسويق" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التسويق</Link>
                      <Link to="/shop?category=كتب المحاسبة" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب المحاسبة</Link>
                      <Link to="/shop?category=كتب التسيير" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التسيير</Link>
                      <Link to="/shop?category=كتب التجارة" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التجارة</Link>
                      <Link to="/shop?category=كتب القانون" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب القانون</Link>
                      <Link to="/shop?category=كتب اللغة" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب اللغة</Link>
                      <Link to="/shop?category=كتب الفلسفة" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب الفلسفة</Link>
                      <Link to="/shop?category=كتب التاريخ" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التاريخ</Link>
                      <Link to="/shop?category=علم النفس" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">علم النفس</Link>
                      <Link to="/shop?category=كتب رياضيات" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب رياضيات</Link>
                    </div>
                  </div>

                  <div className="group/school relative">
                    <div className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-stone-50 hover:text-brand-900 transition-colors cursor-pointer text-right text-sm">
                      <span className="font-semibold">كتب مدرسية وشبه مدرسية</span>
                      <ChevronLeft size={14} />
                    </div>
                    <div className="absolute top-0 right-full w-56 bg-white text-stone-800 shadow-xl rounded border border-stone-100 py-2 opacity-0 invisible group-hover/school:opacity-100 group-hover/school:visible transition-all duration-200 z-50 max-h-[70vh] overflow-y-auto hide-scrollbar">
                      <Link to="/shop?category=كتب مدرسية&level=ابتدائي" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التعليم الابتدائي</Link>
                      <Link to="/shop?category=كتب مدرسية&level=متوسط" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التعليم المتوسط</Link>
                      <Link to="/shop?category=كتب مدرسية&level=ثانوي" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">كتب التعليم الثانوي</Link>
                      <Link to="/shop?category=كتب مدرسية&level=بكالوريا" className="block px-4 py-2 hover:bg-stone-50 hover:text-brand-900 transition-colors">بكالوريات وحوليات</Link>
                    </div>
                  </div>

                  <Link to="/shop?category=كتب الادب" className="block px-4 py-2.5 hover:bg-stone-50 hover:text-brand-900 transition-colors text-sm">أدب ورواية</Link>
                  <Link to="/shop?category=كتب الشريعة" className="block px-4 py-2.5 hover:bg-stone-50 hover:text-brand-900 transition-colors text-sm">علوم الشريعة والدين</Link>
                  <Link to="/shop" className="block px-4 py-2.5 hover:bg-stone-50 hover:text-brand-900 transition-colors text-sm font-semibold text-accent-gold bg-stone-900/5">تصفح كافة الكتب</Link>
                </div>
              </li>
              <li><Link to="/publish-book" className="hover:text-accent-gold transition-colors">أنشر معنا</Link></li>
              <li><Link to="/about" className="hover:text-accent-gold transition-colors">من نحن</Link></li>
              <li><Link to="/contact" className="hover:text-accent-gold transition-colors">اتصل بنا</Link></li>
              {dbUser?.role === "admin" && (
                <li><Link to="/admin" className="hover:text-accent-gold transition-colors font-bold text-accent-gold border-r border-brand-800 pr-4">لوحة التحكم والإشراف</Link></li>
              )}
            </ul>
            <div className="flex items-center gap-4 text-stone-200">
              <a href="#" className="hover:text-accent-gold transition-colors"><Facebook size={16} /></a>
              <a href="#" className="hover:text-accent-gold transition-colors"><Twitter size={16} /></a>
              <a href="#" className="hover:text-accent-gold transition-colors"><Linkedin size={16} /></a>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Slide-Out Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setMobileMenuOpen(false)}
          ></div>

          {/* Menu Panel */}
          <div className="relative flex flex-col w-full max-w-xs bg-white text-stone-800 shadow-2xl h-full z-50 mr-auto animate-slide-in">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <span className="font-serif font-bold text-xl text-brand-900">دار المتنبي</span>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 hover:text-stone-900"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="p-4 border-b border-stone-100">
              <form onSubmit={(e) => { handleSearchSubmit(e); setMobileMenuOpen(false); }} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن كتاب أو مؤلف..."
                  className="w-full pl-4 pr-10 py-2 bg-stone-100 border border-transparent rounded focus:bg-white focus:border-accent-gold focus:outline-none text-sm"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
                  <Search size={16} />
                </button>
              </form>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6 text-sm font-medium">
              <ul className="space-y-4">
                <li>
                  <Link 
                    to="/" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                  >
                    الرئيسية
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/shop" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                  >
                    المتجر وكافة الكتب
                  </Link>
                </li>
                <li>
                  <div className="py-2">
                    <span className="text-xs text-stone-400 uppercase tracking-wider block mb-2">الأقسام الجامعية</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link to="/shop?category=كتب الاقتصاد" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">كتب الاقتصاد</Link>
                      <Link to="/shop?category=كتب التسويق" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">كتب التسويق</Link>
                      <Link to="/shop?category=كتب القانون" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">كتب القانون</Link>
                      <Link to="/shop?category=كتب الفلسفة" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">كتب الفلسفة</Link>
                      <Link to="/shop?category=علم النفس" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">علم النفس</Link>
                      <Link to="/shop?category=كتب رياضيات" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">رياضيات وإحصاء</Link>
                    </div>
                  </div>
                </li>
                <li>
                  <div className="py-2">
                    <span className="text-xs text-stone-400 uppercase tracking-wider block mb-2">الأقسام المدرسية</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <Link to="/shop?category=كتب مدرسية&level=ابتدائي" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">تعليم ابتدائي</Link>
                      <Link to="/shop?category=كتب مدرسية&level=متوسط" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">تعليم متوسط</Link>
                      <Link to="/shop?category=كتب مدرسية&level=ثانوي" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">تعليم ثانوي</Link>
                      <Link to="/shop?category=كتب مدرسية&level=بكالوريا" onClick={() => setMobileMenuOpen(false)} className="py-1 hover:text-accent-gold">بكالوريا</Link>
                    </div>
                  </div>
                </li>
                <li>
                  <Link 
                    to="/publish-book" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                  >
                    أنشر كتابك معنا
                  </Link>
                </li>
                {user && (
                  <li>
                    <Link 
                      to="/profile" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                    >
                      الملف الشخصي
                    </Link>
                  </li>
                )}
                <li>
                  <Link 
                    to="/about" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                  >
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/contact" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 text-stone-800 hover:text-accent-gold transition-colors text-base"
                  >
                    اتصل بنا
                  </Link>
                </li>
                {dbUser?.role === "admin" && (
                  <li>
                    <Link 
                      to="/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 text-accent-gold font-bold hover:text-accent-gold-hover transition-colors text-base"
                    >
                      لوحة التحكم والإشراف (قاعدة البيانات)
                    </Link>
                  </li>
                )}
              </ul>
            </div>
            
            <div className="p-5 border-t border-stone-100 text-center text-xs text-stone-400">
              <p>© {new Date().getFullYear()} دار المتنبي للطباعة والنشر.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 bg-stone-50/50">
        {children}
      </main>

      {/* Interactive Support Chat Widget */}
      <div className="fixed bottom-6 left-6 z-50 flex flex-col items-end">
        {/* Chat Window Panel */}
        {isChatOpen && (
          <div className="w-[360px] max-w-[calc(100vw-32px)] h-[500px] bg-white rounded-lg shadow-2xl border border-stone-100 flex flex-col overflow-hidden mb-4 animate-fade-in">
            {/* Header */}
            <div className="bg-brand-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-accent-gold flex items-center justify-center text-brand-900">
                  <Bot size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-none">مساعد دار المتنبي الذكي</h4>
                  <span className="text-[10px] text-stone-300">متصل الآن لمساعدتك</span>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1 rounded-full hover:bg-brand-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {chatMessages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
                      msg.sender === "user" 
                        ? "bg-brand-900 text-white rounded-tl-none" 
                        : "bg-white text-stone-800 border border-stone-100 rounded-tr-none"
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[9px] mt-1 text-left text-stone-400">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-100 rounded-lg rounded-tr-none p-3 shadow-sm max-w-[80%]">
                    <div className="flex gap-1 items-center py-1">
                      <div className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Replies */}
            <div className="px-4 py-2 bg-stone-50 border-t border-stone-100 flex flex-wrap gap-2 overflow-x-auto max-h-24">
              <button 
                onClick={() => sendQuickReply("كيف يمكنني نشر كتابي؟")}
                className="text-xs bg-white hover:bg-brand-50 border border-stone-200 hover:border-brand-300 text-stone-600 hover:text-brand-900 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap shadow-sm"
              >
                كيف أنشر كتابي؟
              </button>
              <button 
                onClick={() => sendQuickReply("ما هي تكاليف وخطوات الطباعة؟")}
                className="text-xs bg-white hover:bg-brand-50 border border-stone-200 hover:border-brand-300 text-stone-600 hover:text-brand-900 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap shadow-sm"
              >
                تكاليف الطباعة
              </button>
              <button 
                onClick={() => sendQuickReply("رقم الهاتف وطرق الاتصال بكم؟")}
                className="text-xs bg-white hover:bg-brand-50 border border-stone-200 hover:border-brand-300 text-stone-600 hover:text-brand-900 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap shadow-sm"
              >
                رقم الهاتف والاتصال
              </button>
              <button 
                onClick={() => sendQuickReply("هل تتوفر خدمة توصيل الكتب؟")}
                className="text-xs bg-white hover:bg-brand-50 border border-stone-200 hover:border-brand-300 text-stone-600 hover:text-brand-900 rounded-full px-3 py-1.5 transition-colors whitespace-nowrap shadow-sm"
              >
                خدمة توصيل الكتب
              </button>
            </div>

            {/* Input Form */}
            <form id="chat-form" onSubmit={handleSendMessage} className="p-3 border-t border-stone-100 flex gap-2 bg-white">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="اكتب استفسارك هنا..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900 focus:bg-white"
              />
              <button 
                type="submit" 
                className="bg-brand-900 hover:bg-brand-800 text-white rounded p-2.5 transition-colors flex items-center justify-center shrink-0 shadow-md"
              >
                <Send size={16} className="transform rotate-180" />
              </button>
            </form>
          </div>
        )}

        {/* Floating Trigger Button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-accent-gold hover:bg-accent-gold-hover text-brand-900 w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 group focus:outline-none"
          title="تواصل مع المساعد الذكي"
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />}
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-brand-900 text-stone-300 pt-16 pb-8 border-t-[4px] border-accent-gold">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                <img 
                  src="/logo.png" 
                  alt="دار المتنبي للطباعة والنشر" 
                  className="w-full h-full object-contain" 
                  onError={(e) => { e.currentTarget.src = 'https://placehold.co/100x100/fcfbf9/1a233a?text=Logo'; }} 
                />
              </div>
              <span className="font-serif font-bold text-xl text-white">دار المتنبي</span>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              دار نشر عريقة تسعى لنشر المعرفة والثقافة من خلال انتقاء أفضل الكتب والمؤلفات لقرائنا في الوطن العربي.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 font-serif text-lg">روابط سريعة</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-accent-gold transition-colors">من نحن</Link></li>
              <li><Link to="/shop" className="hover:text-accent-gold transition-colors">المتجر</Link></li>
              <li><Link to="/publish-book" className="hover:text-accent-gold transition-colors">أنشر معنا</Link></li>
              <li><Link to="/contact" className="hover:text-accent-gold transition-colors">اتصل بنا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 font-serif text-lg">الأقسام الرئيسية</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/shop?category=كتب الاقتصاد" className="hover:text-accent-gold transition-colors">كتب الاقتصاد والتسيير</Link></li>
              <li><Link to="/shop?category=كتب القانون" className="hover:text-accent-gold transition-colors">كتب القانون والعلوم السياسية</Link></li>
              <li><Link to="/shop?category=كتب الادب" className="hover:text-accent-gold transition-colors">أدب ورواية</Link></li>
              <li><Link to="/shop?category=كتب مدرسية" className="hover:text-accent-gold transition-colors">الكتب المدرسية وحوليات البكالوريا</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-6 font-serif text-lg">النشرة البريدية</h4>
            <p className="text-sm text-stone-400 mb-4">اشترك ليصلك جديد إصداراتنا وعروضنا الحصرية.</p>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="البريد الإلكتروني" 
                className="flex-1 bg-brand-800 border-none px-4 py-2.5 rounded-r focus:outline-none focus:ring-1 focus:ring-accent-gold text-white text-sm" 
              />
              <button 
                type="submit" 
                className="bg-accent-gold hover:bg-accent-gold-hover text-brand-900 font-bold px-4 py-2.5 rounded-l transition-colors text-sm"
              >
                اشترك
              </button>
            </form>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 border-t border-brand-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-stone-500">
          <p>© {new Date().getFullYear()} دار المتنبي للطباعة والنشر والتوزيع. جميع الحقوق محفوظة.</p>
          <div className="mt-4 md:mt-0 flex gap-4">
            <span className="hover:text-stone-300 cursor-pointer">سياسة الخصوصية</span>
            <span className="hover:text-stone-300 cursor-pointer">شروط الاستخدام</span>
          </div>
        </div>
      </footer>

      {/* Iframe & Popup Login Error Mitigation Modal */}
      {showIframeLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-stone-850" dir="rtl">
          <div className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center border-b border-brand-850">
              <h3 className="font-serif font-bold text-lg flex items-center gap-2">
                <ShieldAlert className="text-accent-gold" size={20} />
                <span>تنبيه أمان تسجيل الدخول</span>
              </h3>
              <button 
                onClick={() => setShowIframeLoginModal(false)}
                className="text-stone-300 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 border border-amber-200">
                <AlertCircle size={32} />
              </div>
              
              <div className="text-center space-y-2">
                <h4 className="font-bold text-stone-800 text-sm">حظر النوافذ المنبثقة مفعّل أو الإطار محمي</h4>
                <p className="text-stone-500 text-xs leading-relaxed">
                  نظراً لقيود الأمان المفروضة من متصفحك على المواقع التي تعمل داخل إطارات مدمجة (Iframe)، يحظر المتصفح إتمام تسجيل الدخول عبر Google بشكل مباشر هنا.
                </p>
                <p className="text-brand-900 font-bold text-xs leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200">
                  لحل هذه المشكلة وتوقيع العقود أو شراء الكتب، يرجى فتح الموقع في علامة تبويب جديدة مستقلة والمحاولة مجدداً.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs text-center leading-normal">
                  {loginError}
                </div>
              )}
            </div>
            
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
              <a 
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-accent-gold hover:bg-accent-gold-hover text-brand-900 font-bold py-2.5 px-4 rounded-lg text-xs flex items-center justify-center gap-2 transition-all shadow-md text-center"
              >
                <ExternalLink size={14} />
                <span>الفتح في علامة تبويب جديدة</span>
              </a>
              <button 
                onClick={() => {
                  executeSignIn();
                }}
                className="py-2.5 px-4 text-stone-600 hover:text-stone-800 font-bold text-xs hover:bg-stone-100 rounded-lg transition-all text-center border border-stone-200"
              >
                المحاولة هنا على أي حال
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
