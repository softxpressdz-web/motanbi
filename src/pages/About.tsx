import { motion } from "motion/react";
import { BookOpen, PenTool, CheckCircle, Mail, Phone, MapPin, MessageCircle, Send, MessageSquare } from "lucide-react";

export function About() {
  return (
    <div className="flex flex-col pb-16">
      {/* Hero Section */}
      <section className="bg-brand-900 text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-6"
          >
            حول دار المتنبي للطباعة والنشر
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed"
          >
            مؤسسة علمية ثقافية تُعنى بطباعة ونشر الكتب والأبحاث العلمية الرصينة في مختلف التخصصات والمستويات العلمية.
          </motion.p>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">خدماتنا التنافسية</h2>
          <p className="text-stone-500 max-w-2xl mx-auto">
            في هذا الإطار تقوم المؤسسة بتقديم خدمات تنافسية لكل من القارئ والمؤلف، سعياً منا لنشر المعرفة والثقافة.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Reader Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 rounded-lg shadow-sm border border-stone-200"
          >
            <div className="w-14 h-14 bg-brand-50 rounded-full flex items-center justify-center mb-6">
              <BookOpen className="text-brand-900" size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-brand-900 mb-6">القارئ والمُطالع</h3>
            <p className="text-stone-600 mb-6">من خلال توفير منتجات علمية وأدبية راقية:</p>
            <ul className="space-y-4">
              {[
                "في مختلف التخصصات",
                "في كل المستويات",
                "تلبي حاجة وشغف القارئ والمطالع"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-accent-gold mt-1 flex-shrink-0" size={18} />
                  <span className="text-stone-700">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Author Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-brand-900 p-8 rounded-lg shadow-sm text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-800 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
            <div className="w-14 h-14 bg-brand-800 rounded-full flex items-center justify-center mb-6 relative z-10">
              <PenTool className="text-accent-gold" size={28} />
            </div>
            <h3 className="text-2xl font-serif font-bold text-white mb-6 relative z-10">بالنسبة للمؤلفين</h3>
            <p className="text-stone-300 mb-6 relative z-10">نقدم الدعم الكامل من المراجعة حتى التسويق:</p>
            <ul className="space-y-4 relative z-10">
              {[
                "تدقيق الأعمال العلمية قبل النشر",
                "اخراج العمل بالشكل والتصميم المناسب",
                "تتجهز المؤسسة بالامكانيات اللازمة لطباعة المنتجات العلمية والأدبية بجودة عالية",
                "نشر المنتجات العلمية والأدبية والعمل على تسويقها بطريقة حديثة وفعالة"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="text-accent-gold mt-1 flex-shrink-0" size={18} />
                  <span className="text-stone-200">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </section>

      {/* Contact & Map Section */}
      <section className="bg-stone-50 py-16 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-brand-900 mb-8">تواصل معنا</h2>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-stone-100">
                  <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 mb-1">البريد الإلكتروني</div>
                    <a href="mailto:elmotanaby.dz@gmail.com" className="font-medium text-brand-900 hover:text-accent-gold transition-colors block font-mono" dir="ltr">
                      elmotanaby.dz@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-stone-100">
                  <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 mb-1">أرقام الهاتف</div>
                    <a href="tel:+213668144975" className="font-medium text-brand-900 hover:text-accent-gold transition-colors block font-mono" dir="ltr">
                      +213 668 14 49 75
                    </a>
                    <a href="tel:+213773305282" className="font-medium text-brand-900 hover:text-accent-gold transition-colors block mt-1 font-mono" dir="ltr">
                      +213 773 30 52 82
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-stone-100">
                  <div className="w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 flex-shrink-0">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <div className="text-sm text-stone-500 mb-1">الموقع والمقر الرئيسي</div>
                    <div className="font-medium text-brand-900 text-xs sm:text-sm">
                      حي تعاونية الشيخ المقراني، المسيلة، الجزائر (مقابل لجامعة المسيلة)
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-stone-200">
                <h3 className="font-bold text-brand-900 mb-4">تواصل فوري</h3>
                <div className="flex gap-3">
                  <a href="https://wa.me/213668144975" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors" title="واتساب">
                    <MessageCircle size={22} />
                  </a>
                  <a href="https://t.me/213668144975" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0088cc]/10 text-[#0088cc] hover:bg-[#0088cc] hover:text-white transition-colors" title="تيليجرام">
                    <Send size={22} />
                  </a>
                  <button className="w-12 h-12 rounded-full flex items-center justify-center bg-brand-50 text-brand-900 hover:bg-brand-900 hover:text-accent-gold transition-colors" title="محادثة مباشرة">
                    <MessageSquare size={22} />
                  </button>
                </div>
              </div>
            </div>

            <div className="h-[400px] rounded-lg overflow-hidden shadow-md border border-stone-200">
              <iframe 
                src="https://www.google.com/maps?ll=35.7181,4.524269&z=13&t=m&hl=fr-FR&gl=US&mapclient=embed&q=%D8%AF%D8%A7%D8%B1+%D8%A7%D9%84%D9%85%D8%AA%D9%86%D8%A8%D9%8A+%D9%84%D9%84%D8%B7%D8%A8%D8%A7%D8%B9%D8%A9+%D9%88%D8%A7%D9%84%D9%86%D8%B4%D8%B1&output=embed"
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen={true} 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="موقع دار المتنبي"
              ></iframe>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
