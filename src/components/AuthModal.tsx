import React, { useState } from "react";
import { X, Mail, Lock, LogIn, UserPlus, AlertCircle, ShieldAlert, Loader2, ExternalLink } from "lucide-react";
import { auth, googleAuthProvider } from "../lib/firebase";
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from "firebase/auth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
      onClose();
    } catch (err: any) {
      console.error("Google Login failed:", err);
      if (
        err.code === "auth/cancelled-popup-request" ||
        err.code === "auth/popup-blocked" ||
        err.message?.includes("Pending promise was never set") ||
        err.message?.includes("cancelled-popup")
      ) {
        setError("تم حظر نافذة تسجيل الدخول المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة أو المحاولة مرة أخرى.");
      } else if (err.code === "auth/unauthorized-domain") {
        setError("نطاق الموقع الحالي غير مصرح به في إعدادات Firebase Auth.");
      } else {
        setError(err.message || "فشل تسجيل الدخول. يرجى تكرار المحاولة.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
      }
      onClose();
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("البريد الإلكتروني مستخدم بالفعل.");
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (err.code === "auth/weak-password") {
        setError("كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف على الأقل.");
      } else {
        setError(err.message || "حدث خطأ أثناء المصادقة.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 text-stone-850" dir="rtl">
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center border-b border-brand-850">
          <h3 className="font-serif font-bold text-lg flex items-center gap-2">
            <ShieldAlert className="text-accent-gold" size={20} />
            <span>{isLogin ? "تسجيل الدخول" : "إنشاء حساب جديد"}</span>
          </h3>
          <button 
            onClick={onClose}
            className="text-stone-300 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-700 font-bold py-2.5 px-4 rounded-lg hover:bg-stone-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            المتابعة باستخدام حساب Google
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-stone-200"></div>
            <span className="flex-shrink-0 mx-4 text-stone-400 text-sm">أو</span>
            <div className="flex-grow border-t border-stone-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">الاسم الكامل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                    <UserPlus size={16} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                    className="w-full pl-4 pr-10 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-900 focus:border-brand-900 text-sm"
                    placeholder="الاسم الكامل"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">البريد الإلكتروني</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-4 pr-10 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-900 focus:border-brand-900 text-sm"
                  placeholder="example@domain.com"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">كلمة المرور</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-4 pr-10 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-900 focus:border-brand-900 text-sm"
                  placeholder="••••••••"
                  dir="ltr"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-900 hover:bg-brand-850 text-white font-bold py-2.5 rounded-lg transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : isLogin ? (
                <>
                  <LogIn size={18} />
                  <span>دخول</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>إنشاء حساب</span>
                </>
              )}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-sm text-brand-900 hover:text-brand-800 font-bold"
            >
              {isLogin ? "ليس لديك حساب؟ قم بإنشاء حساب جديد" : "لديك حساب بالفعل؟ قم بتسجيل الدخول"}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-stone-100 text-center">
            <p className="text-xs text-stone-500 mb-2">
              إذا واجهت مشكلة في تسجيل الدخول عبر Google بسبب حظر النوافذ المنبثقة، يمكنك استخدام رابط الفتح المباشر أدناه.
            </p>
            <a 
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 py-2 px-3 text-brand-900 hover:bg-stone-50 rounded font-bold text-xs border border-stone-200 transition-colors"
            >
              <ExternalLink size={14} />
              <span>الفتح في علامة تبويب جديدة</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
