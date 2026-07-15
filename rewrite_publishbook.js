import fs from 'fs';

const code = `import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, FileText, CheckCircle, Send, Book, AlertCircle, HelpCircle, FileCheck2, ArrowLeft } from "lucide-react";
import { Link } from "react-router"; // added for the Link component

export function PublishBook() {
  const [authorName, setAuthorName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookCategory, setBookCategory] = useState("ادب");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile(file);
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 100);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFile) {
      setErrorMessage("الرجاء إرفاق ملف المخطوطة");
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch("/api/manuscripts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorName,
          email,
          phone,
          bookCategory,
          bookTitle,
          summary,
          pageCount: 0,
          coverType: "paperback",
          printCopies: 0,
          productionCostPerBook: "0",
          retailPrice: "0",
          royaltyPerSale: "0",
          totalPrintCost: "0",
          signatureName: "",
          uploadedFileName: uploadedFile ? uploadedFile.name : "draft_manuscript.pdf",
          status: "pending_review",
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.message || "حدث خطأ في الخادم أثناء إرسال المخطوط. يرجى المحاولة لاحقاً.");
      }

      setFormSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err.message || "فشل إرسال الطلب، يرجى التحقق من اتصالك والمحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-stone-50 min-h-screen py-16" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 mb-6 tracking-tight">
            أنشر كتابك معنا
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            نحن في دار المتنبي نهتم بإبداعك. أرسل مخطوطتك الآن، وسيقوم فريق التحرير بمراجعتها وتقييمها. بعد المراجعة، سنقدم لك عرضاً مالياً وعقد نشر تفصيلياً للاطلاع عليه والموافقة.
          </p>
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-stone-150 overflow-hidden">
          <div className="p-8 md:p-12">
            <AnimatePresence mode="wait">
              {!formSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <div className="mb-10 text-center">
                    <h2 className="text-2xl font-serif font-bold text-brand-900 flex items-center justify-center gap-3">
                      <Book className="text-accent-gold" />
                      تفاصيل المخطوطة والمؤلف
                    </h2>
                    <p className="text-sm text-stone-500 mt-2">يرجى تعبئة كافة البيانات بدقة لضمان التواصل الفعال</p>
                  </div>

                  {errorMessage && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-sm flex items-start gap-3 border border-red-100">
                      <AlertCircle className="shrink-0 mt-0.5" size={18} />
                      <p>{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Author Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">الاسم الكامل (المؤلف)</label>
                        <input
                          type="text"
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm"
                          placeholder="الاسم كما سيظهر على الكتاب"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">رقم الهاتف</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm"
                          placeholder="رقم هاتف للتواصل"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700">البريد الإلكتروني</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm"
                        placeholder="البريد الإلكتروني للإشعارات"
                        dir="ltr"
                      />
                    </div>

                    <hr className="border-stone-100" />

                    {/* Book Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">عنوان المخطوطة / الكتاب</label>
                        <input
                          type="text"
                          required
                          value={bookTitle}
                          onChange={(e) => setBookTitle(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm"
                          placeholder="العنوان المقترح"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-stone-700">تصنيف الكتاب</label>
                        <select
                          value={bookCategory}
                          onChange={(e) => setBookCategory(e.target.value)}
                          className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm"
                        >
                          <option value="ادب">أدب ورواية</option>
                          <option value="شعر">شعر</option>
                          <option value="تاريخ">تاريخ</option>
                          <option value="تطوير_ذات">تطوير الذات</option>
                          <option value="دين_وشريعة">علوم شرعية ودين</option>
                          <option value="اقتصاد">اقتصاد وتسيير</option>
                          <option value="قانون">حقوق وقانون</option>
                          <option value="اكاديمي">أكاديمي وبحثي</option>
                          <option value="اخرى">أخرى</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700 flex justify-between">
                        <span>ملخص عن الكتاب (نبذة)</span>
                        <span className="text-xs text-stone-400 font-normal">اختياري ولكنه مفضل</span>
                      </label>
                      <textarea
                        rows={4}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-1 focus:ring-accent-gold focus:border-accent-gold transition-all text-sm resize-none"
                        placeholder="اكتب نبذة مختصرة عن محتوى الكتاب، الفئة المستهدفة، أو الرسالة الرئيسية..."
                      />
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-stone-700">إرفاق ملف المخطوطة</label>
                      <div 
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={\`border-2 border-dashed rounded-xl p-8 text-center transition-all \${
                          uploadedFile ? 'border-brand-500 bg-brand-50' : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                        }\`}
                      >
                        <input
                          type="file"
                          id="file-upload"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx"
                        />
                        
                        {!uploadedFile ? (
                          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-stone-400">
                              <Upload size={24} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-brand-900">اضغط لرفع الملف أو اسحبه هنا</p>
                              <p className="text-xs text-stone-500 mt-1">صيغ مدعومة: PDF, DOC, DOCX (الحد الأقصى 20MB)</p>
                            </div>
                          </label>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600">
                              <FileText size={24} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-bold text-brand-900">{uploadedFile.name}</p>
                              <p className="text-xs text-stone-500 mt-1">{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                            
                            {uploadProgress < 100 ? (
                              <div className="w-full max-w-xs bg-stone-200 rounded-full h-1.5 mt-2 overflow-hidden">
                                <div 
                                  className="bg-brand-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                                  style={{ width: \`\${uploadProgress}%\` }}
                                ></div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold mt-1">
                                <CheckCircle size={14} />
                                <span>تم الرفع بنجاح</span>
                              </div>
                            )}
                            
                            <button
                              type="button"
                              onClick={() => setUploadedFile(null)}
                              className="text-xs text-red-600 hover:text-red-700 font-medium underline mt-2"
                            >
                              إزالة الملف
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2 py-2">
                      <input 
                        type="checkbox" 
                        required 
                        id="agree_terms"
                        disabled={isSubmitting}
                        className="rounded text-accent-gold focus:ring-accent-gold w-4 h-4 mt-0.5 disabled:opacity-60" 
                      />
                      <label htmlFor="agree_terms" className="text-xs text-stone-500 leading-normal cursor-pointer select-none">
                        أوافق بصفتي الكاتب والمؤلف الشرعي على المخطوط، وأفوض دار المتنبي لمراجعته. قرأت وأوافق على <Link to="/publishing-policy" className="text-brand-900 underline">سياسة النشر</Link>.
                      </label>
                    </div>

                    <div className="pt-4 border-t border-stone-100">
                      <button
                        type="submit"
                        disabled={isSubmitting || !uploadedFile || uploadProgress < 100}
                        className="w-full bg-brand-900 text-white font-bold py-4 rounded-xl hover:bg-brand-850 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            <span>جاري الإرسال...</span>
                          </>
                        ) : (
                          <>
                            <span>إرسال المخطوط للمراجعة</span>
                            <Send size={20} className="rotate-180" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} />
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-brand-900 mb-4">تم استلام مخطوطتك بنجاح!</h2>
                  <p className="text-stone-600 leading-relaxed max-w-lg mx-auto mb-8">
                    شكراً لثقتك بدار المتنبي. جاري الآن إحالة مخطوطتك (<strong>{bookTitle}</strong>) إلى لجان القراءة والمراجعة.
                    سنقوم بدراستها وتحديد تكاليف الطباعة وسعر البيع المقترح، ثم سنرسل لك عرضاً وعقداً مفصلاً للموافقة عليه من خلال حسابك.
                  </p>
                  
                  <div className="bg-stone-50 rounded-xl p-6 mb-8 text-right border border-stone-200">
                    <h3 className="font-bold text-brand-900 mb-4 flex items-center gap-2">
                      <FileCheck2 size={18} className="text-accent-gold" />
                      ماذا سيحدث بعد ذلك؟
                    </h3>
                    <ul className="space-y-3 text-sm text-stone-700">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">1</span>
                        <span>مراجعة وتقييم المخطوطة من قبل فريق التحرير.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">2</span>
                        <span>تحديد تكلفة الإنتاج وسعر البيع بناءً على المراجعة الفنية.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-900 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">3</span>
                        <span>إرسال العقد والمقترح المالي إلى حسابك الشخصي للموافقة.</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <button 
                      onClick={() => {
                        setFormSubmitted(false);
                        setAuthorName("");
                        setBookTitle("");
                        setSummary("");
                        setUploadedFile(null);
                        setUploadProgress(0);
                      }}
                      className="text-brand-900 font-bold border-2 border-brand-900 px-6 py-2.5 rounded hover:bg-brand-50 transition-all flex items-center gap-2"
                    >
                      <span>إرسال مخطوطة أخرى</span>
                    </button>
                    <Link
                      to="/profile"
                      className="bg-brand-900 text-white font-bold px-6 py-2.5 rounded hover:bg-brand-850 transition-all"
                    >
                      الذهاب إلى حسابي
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/PublishBook.tsx', code);
