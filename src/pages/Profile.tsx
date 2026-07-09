import React, { useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { motion } from "motion/react";
import { User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2 } from "lucide-react";

interface ProfileProps {
  user: FirebaseUser | null;
  dbUser: any;
}

export function Profile({ user, dbUser }: ProfileProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (dbUser) {
      setFormData({
        name: dbUser.name || "",
        phone: dbUser.phone || "",
        address: dbUser.address || ""
      });
    }
  }, [dbUser]);

  const handleSubmit = async (e: React.FormEvent) => {
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

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">يرجى تسجيل الدخول أولاً</h2>
        <p className="text-stone-500">تحتاج إلى تسجيل الدخول للوصول إلى ملفك الشخصي.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100"
      >
        <div className="bg-brand-900 p-8 text-white text-center">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
            <User size={40} className="text-accent-gold" />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2">الملف الشخصي</h1>
          <p className="text-stone-300 text-sm">أهلاً بك، {formData.name || user.email}</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start gap-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
                <p className="text-sm font-bold">{successMessage}</p>
              </div>
            )}
            
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-bold">
                {errorMessage}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <User size={16} className="text-stone-400" /> الاسم الكامل
                </label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <Mail size={16} className="text-stone-400" /> البريد الإلكتروني
                </label>
                <input 
                  type="email" 
                  value={user.email || ""}
                  disabled
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 text-sm bg-stone-100 text-stone-500 cursor-not-allowed"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <Phone size={16} className="text-stone-400" /> رقم الهاتف
                </label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50 text-right"
                  placeholder="05XX XX XX XX"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-stone-700 flex items-center gap-2">
                  <MapPin size={16} className="text-stone-400" /> العنوان بالتفصيل
                </label>
                <textarea 
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg border border-stone-200 focus:outline-none focus:border-brand-900 focus:ring-1 focus:ring-brand-900 text-sm bg-stone-50 min-h-[100px]"
                  placeholder="الولاية، البلدية، الحي، الشارع، رقم المنزل..."
                />
              </div>
            </div>

            <div className="pt-6 border-t border-stone-100 flex justify-end">
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>جاري الحفظ...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>حفظ التعديلات</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
