import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, Phone, MapPin, MessageCircle, Send, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Custom trigger for Live Chat Assistant
  const handleOpenLiveChat = () => {
    const event = new CustomEvent("open-live-chat");
    window.dispatchEvent(event);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!response.ok) {
        throw new Error("حدث خطأ في الخادم أثناء إرسال الرسالة. يرجى المحاولة لاحقاً.");
      }

      setIsSubmitted(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");

      setTimeout(() => {
        setIsSubmitted(false);
      }, 6000);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشل الاتصال بالخادم. يرجى التحقق من جودة الإنترنت.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col pb-0 text-stone-850" dir="rtl">
      
      {/* Toast alert on success */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-brand-900 text-white px-6 py-4 rounded-lg shadow-2xl border-l-[4px] border-accent-gold z-50 flex items-center gap-3 text-sm font-semibold min-w-[320px]"
          >
            <CheckCircle2 className="text-accent-gold shrink-0" size={20} />
            <div className="text-right">
              <span className="block font-bold text-white">تم إرسال رسالتك بنجاح!</span>
              <span className="text-xs text-stone-300 font-normal">سيتواصل معك قسم علاقات المؤلفين والجمهور قريباً.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="bg-brand-900 text-white py-16 md:py-24 relative overflow-hidden border-b-4 border-accent-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white"
          >
            تواصل معنا
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light"
          >
            سواء كنت قارئاً يبحث عن كتاب مفضل، أو مؤلفاً يطمح لنشر مخطوطته الإبداعية، نحن هنا للاستماع ومساندتك عبر كافة قنوات التواصل الفوري.
          </motion.p>
        </div>
      </section>

      {/* Content Columns */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 w-full">
        <div className="grid lg:grid-cols-12 gap-12">
          
          {/* Right Column: Information & Live Links */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">معلومات الاتصال المباشر</h2>
              <p className="text-stone-500 leading-relaxed text-sm">
                مكتب استقبال المؤلفين والعملاء مفتوح طوال أيام الأسبوع باستثناء أيام الجمعة والسبت، من الساعة 8:00 صباحاً وحتى 4:30 مساءً. يسعدنا استقبالكم واتصالاتكم!
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-stone-150 transition-colors hover:border-accent-gold group">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0 group-hover:bg-brand-900 group-hover:text-accent-gold transition-colors shadow-inner">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">البريد الإلكتروني العام</div>
                  <a href="mailto:contact@elmotanaby.com" className="font-bold text-brand-900 block font-mono" dir="ltr">
                    contact@elmotanaby.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-stone-150 transition-colors hover:border-accent-gold group">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0 group-hover:bg-brand-900 group-hover:text-accent-gold transition-colors shadow-inner">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">رقم الهاتف المركزي للدار</div>
                  <a href="tel:+213660000000" className="font-bold text-brand-900 block font-mono" dir="ltr">
                    +213 660 00 00 00
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-white p-5 rounded-lg shadow-sm border border-stone-150 transition-colors hover:border-accent-gold group">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0 group-hover:bg-brand-900 group-hover:text-accent-gold transition-colors shadow-inner">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs text-stone-400 mb-0.5">العنوان والمقر الرئيسي</div>
                  <div className="font-bold text-brand-900">
                    حي وادي الرمان، البليدة (الجزائر العاصمة)، الجمهورية الجزائرية
                  </div>
                </div>
              </div>
            </div>

            {/* Instant messaging section (WhatsApp, Telegram, Live Chat) */}
            <div className="pt-6 border-t border-stone-200">
              <h3 className="font-bold text-brand-900 mb-4 text-base">قنوات المراسلة الفورية المباشرة</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* WhatsApp */}
                <a 
                  href="https://wa.me/213660000000?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%20%D8%AF%D8%A7%D8%B1%20%D8%A7%D9%84%D9%85%D8%AA%D9%86%D8%A8%D9%8A%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-2 bg-[#25D366]/5 text-[#25D366] hover:bg-[#25D366] hover:text-white p-4 rounded-lg transition-all border border-[#25D366]/10 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageCircle size={24} />
                  <span className="font-bold text-xs">مراسلة واتساب</span>
                </a>
                
                {/* Telegram */}
                <a 
                  href="https://t.me/elmotanaby_publish" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-2 bg-[#0088cc]/5 text-[#0088cc] hover:bg-[#0088cc] hover:text-white p-4 rounded-lg transition-all border border-[#0088cc]/10 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Send size={24} className="transform rotate-45" />
                  <span className="font-bold text-xs">قناة تيليجرام</span>
                </a>

                {/* Direct Live Chat Assistant */}
                <button 
                  onClick={handleOpenLiveChat}
                  className="flex flex-col items-center justify-center gap-2 bg-brand-50 text-brand-900 hover:bg-brand-900 hover:text-accent-gold p-4 rounded-lg transition-all border border-brand-100 shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <MessageSquare size={24} />
                  <span className="font-bold text-xs">محادثة حية فورا</span>
                </button>
              </div>
            </div>
          </div>

          {/* Left Column: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 md:p-8 rounded-lg border border-stone-200 shadow-md h-full">
              <h3 className="text-2xl font-serif font-bold text-brand-900 mb-4">أرسل لنا رسالة بريدية</h3>
              <p className="text-stone-400 text-xs mb-6 leading-relaxed">
                إذا كان لديك أي شكوى، اقتراح، أو طلب خاص، لا تتردد في استخدام النموذج أدناه. سيتكفل فريق المراسلات بمعالجة طلبك خلال 24 ساعة كحد أقصى.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">الاسم الكامل *</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                      placeholder="أدخل اسمك"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1">البريد الإلكتروني *</label>
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold text-right disabled:opacity-60"
                      placeholder="name@example.com"
                      dir="ltr"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">الموضوع المقترح *</label>
                  <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                    placeholder="عنوان الرسالة"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">تفاصيل الرسالة أو الاستفسار *</label>
                  <textarea 
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold disabled:opacity-60"
                    placeholder="اكتب كل التفاصيل التي ترغب في توضيحها هنا..."
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md cursor-pointer disabled:bg-stone-400 disabled:cursor-not-allowed disabled:scale-100"
                >
                  <Send size={16} className={isSubmitting ? "animate-ping" : ""} />
                  <span>{isSubmitting ? "جاري الإرسال وحفظ الرسالة..." : "إرسال الرسالة إلى قسم خدمة العملاء"}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-stone-50 py-16 border-t border-stone-200">
        <div className="max-w-7xl mx-auto px-4 w-full text-center">
          <h2 className="text-2xl font-serif font-bold text-brand-900 mb-8">موقع مقر دار المتنبي للطباعة والنشر</h2>
          <div className="h-[450px] w-full rounded-lg overflow-hidden shadow-md border border-stone-200">
            <iframe 
              src="https://www.google.com/maps?ll=35.7181,4.524269&z=13&t=m&hl=fr-FR&gl=US&mapclient=embed&q=%D8%AF%D8%A7%D8%B1+%D8%A7%D9%84%D9%85%D8%AA%D9%85%D8%A8%D9%8A+%D9%84%D9%84%D8%B7%D8%A8%D8%A7%D8%B9%D8%A9+%D9%88%D8%A7%D9%84%D9%86%D8%B4%D8%B1&output=embed"
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer"
              title="موقع دار المتنبي"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
