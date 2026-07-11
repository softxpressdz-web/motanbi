import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Upload, FileText, CheckCircle, Send, Book, AlertCircle, 
  Handshake, HelpCircle, Calculator, FileCheck2, ArrowLeft, Signature 
} from "lucide-react";

export function PublishBook() {
  const [authorName, setAuthorName] = useState("");
  const [bookTitle, setBookTitle] = useState("");
  const [bookCategory, setBookCategory] = useState("ادب");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // Interactive pricing calculator states
  const [pageCount, setPageCount] = useState(150);
  const [coverType, setCoverType] = useState("paperback"); // paperback or hardcover
  const [printCopies, setPrintCopies] = useState(1000);
  const [isCustomCopies, setIsCustomCopies] = useState(false);
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form states
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [pricingApproved, setPricingApproved] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [summary, setSummary] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Calculate pricing estimates
  const baseCostPerPage = 2; // DA
  const coverCost = coverType === "hardcover" ? 350 : 150; // DA
  const productionCostPerBook = (pageCount * baseCostPerPage) + coverCost;
  
  // Recommended retail selling price based on cost
  const retailPrice = Math.round(productionCostPerBook * 1.8);
  
  // Total printing quote for bulk copies
  const totalPrintCost = productionCostPerBook * (printCopies || 0);
  
  // Simulated royalties (e.g. 70% of profit if self-published, or standard 10% royalty on sales)
  const royaltyPerSale = Math.round(retailPrice * 0.10);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFile(file);
      // Simulate file upload progress
      setUploadProgress(10);
      const timer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 30;
        });
      }, 200);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handleApproveQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureName.trim()) return;

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
          pageCount,
          coverType,
          printCopies,
          productionCostPerBook,
          retailPrice,
          royaltyPerSale,
          totalPrintCost,
          signatureName,
          uploadedFileName: uploadedFile ? uploadedFile.name : "draft_manuscript.pdf",
          status: "contract_signed",
        }),
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {}
        throw new Error(errorData?.message || "حدث خطأ في الخادم أثناء حفظ المخطوط وتوقيع العقد. يرجى المحاولة لاحقاً.");
      }

      setPricingApproved(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "فشل الاتصال بالخادم لحفظ وتوقيع العقد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col pb-24 text-stone-850" dir="rtl">
      
      {/* Hero Section */}
      <section className="bg-brand-900 text-white py-16 md:py-24 relative overflow-hidden border-b-4 border-accent-gold">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1455390582262-044cdead2708?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-serif font-bold mb-6 text-white"
          >
            بوابة المؤلفين: أنشر كتابك معنا
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-stone-300 max-w-3xl mx-auto leading-relaxed font-light"
          >
            نحن في دار المتنبي نؤمن بأن كل كاتب يحمل كنزاً معرفياً يستحق النشر. نقدم لك تجربة نشر متكاملة تتضمن التقييم، التسعير التفاعلي، التدقيق والطباعة بأعلى المعايير.
          </motion.p>
        </div>
      </section>

      {/* Steps Section highlighting evaluation & pricing approval */}
      <section className="py-16 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-brand-900 mb-3">آلية النشر المعتمدة</h2>
            <p className="text-stone-500">نتبع معايير شفافة تضمن حق الكاتب وجودة المصنف</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { icon: FileText, title: "1. إرسال المخطوطة", desc: "تعبئة بياناتك ورفع جزء من عملك للمراجعة الأولية." },
              { icon: CheckCircle, title: "2. التقييم العلمي", desc: "دراسة وتدقيق المصنف من قِبل المجلس العلمي المختص." },
              { icon: Handshake, title: "3. التسعير والاتفاق", desc: "تحديد تكاليف الطباعة، سعر البيع، ونسبة أرباح المؤلف والموافقة عليها." },
              { icon: Book, title: "4. التنسيق والغلاف", desc: "إخضاع المخطوطة للتدقيق اللغوي وتصميم غلاف احترافي." },
              { icon: Upload, title: "5. الطباعة والتوزيع", desc: "البدء بالطباعة الفاخرة وعرض الكتاب بالمعارض وموقعنا الإلكتروني." },
            ].map((step, idx) => (
              <div key={idx} className="bg-white p-5 rounded-lg border border-stone-200 shadow-sm relative flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-brand-50 text-brand-900 rounded-full flex items-center justify-center mb-4 font-bold border border-brand-100">
                  <step.icon size={22} className="text-brand-900" />
                </div>
                <h3 className="font-bold text-brand-900 text-sm mb-2">{step.title}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main interactive panel */}
      <section className="py-16 max-w-6xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Right Column: Calculator/Helper Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Dynamic Quote & Royalties Estimator */}
            <div className="bg-white p-6 rounded-lg border border-stone-150 shadow-md sticky top-28">
              <h3 className="font-bold text-brand-900 text-base mb-4 flex items-center gap-2 border-b border-stone-100 pb-2.5">
                <Calculator className="text-accent-gold" size={18} /> حاسبة النشر والتسعير التقديرية
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1">عدد صفحات الكتاب المتوقع</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="range" 
                      min="50" 
                      max="600" 
                      step="10"
                      value={pageCount}
                      onChange={(e) => setPageCount(parseInt(e.target.value))}
                      className="flex-1 accent-accent-gold" 
                    />
                    <span className="font-bold text-stone-700 text-sm w-16 text-left">{pageCount} ص</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">نوع تجليد الغلاف</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => setCoverType("paperback")}
                      className={`py-2 text-xs font-bold rounded border transition-all ${
                        coverType === "paperback" 
                          ? "bg-brand-900 text-white border-brand-900" 
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      غلاف ورقي عادي
                    </button>
                    <button 
                      type="button"
                      onClick={() => setCoverType("hardcover")}
                      className={`py-2 text-xs font-bold rounded border transition-all ${
                        coverType === "hardcover" 
                          ? "bg-brand-900 text-white border-brand-900" 
                          : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      مجلد فني فاخر
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-stone-500">حجم الطبعة المطلوبة (عدد النسخ)</label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCopies(!isCustomCopies);
                        if (isCustomCopies) {
                          setPrintCopies(1000);
                        }
                      }}
                      className="text-[11px] font-bold text-brand-900 hover:underline cursor-pointer"
                    >
                      {isCustomCopies ? "إدخال سريع (قائمة)" : "إدخال عدد مخصص يدويًا"}
                    </button>
                  </div>
                  
                  {isCustomCopies ? (
                    <div className="relative flex items-center">
                      <input 
                        type="number" 
                        min="50" 
                        max="100000"
                        step="50"
                        value={printCopies || ""}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setPrintCopies(isNaN(val) ? 0 : val);
                        }}
                        className="w-full p-2 pl-12 border border-stone-200 rounded text-xs focus:outline-none bg-stone-50 font-bold"
                        placeholder="أدخل عدد النسخ المطلوبة (مثال: 300)"
                      />
                      <span className="absolute left-3 text-[10px] font-bold text-stone-500">نسخة</span>
                    </div>
                  ) : (
                    <select 
                      value={printCopies}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "custom") {
                          setIsCustomCopies(true);
                        } else {
                          setPrintCopies(parseInt(val));
                        }
                      }}
                      className="w-full p-2 border border-stone-200 rounded text-xs focus:outline-none bg-stone-50 font-bold cursor-pointer"
                    >
                      <option value={500}>500 نسخة</option>
                      <option value={1000}>1000 نسخة (طبعة أولى قياسية)</option>
                      <option value={2000}>2000 نسخة</option>
                      <option value={5000}>5000 نسخة (طبعة كبرى)</option>
                      <option value="custom">كتابة عدد نسخ مخصص...</option>
                    </select>
                  )}
                </div>

                {/* Estimate Outputs */}
                <div className="bg-stone-50 p-4 rounded border border-stone-150 space-y-2.5 text-xs text-stone-600 mt-4">
                  <div className="flex justify-between">
                    <span>تكلفة إنتاج الكتاب الفردي:</span>
                    <span className="font-bold text-stone-800">{productionCostPerBook} د.ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span>سعر البيع المقترح للجمهور:</span>
                    <span className="font-bold text-stone-800">{retailPrice} د.ج</span>
                  </div>
                  <div className="flex justify-between border-t border-stone-200 pt-2 text-brand-900 font-bold">
                    <span>عائد الكاتب عن كل نسخة مبيعة (10%):</span>
                    <span className="text-accent-gold">{royaltyPerSale} د.ج</span>
                  </div>
                  <div className="flex justify-between">
                    <span>التكلفة الإجمالية لطباعة الكمية:</span>
                    <span className="font-bold text-stone-800">{totalPrintCost.toLocaleString()} د.ج</span>
                  </div>
                </div>

                <p className="text-[10px] text-stone-400 leading-normal">
                  * هذه الحسابات تقديرية وتخضع لمراجعة المجلس العلمي لدار المتنبي عند مراجعة المخطوط الكامل.
                </p>
              </div>
            </div>

            <div className="bg-brand-50 border border-brand-100 p-5 rounded-lg text-xs leading-relaxed text-brand-950">
              <h4 className="font-bold mb-2 flex items-center gap-1.5"><AlertCircle size={14} className="text-brand-900" /> ميثاق التسعير العادل</h4>
              <p>نلتزم في دار المتنبي بإشراك المؤلف بالكامل في تسعير المصنف. لا نقوم بطباعة أو اعتماد أي طبعة إلا بعد حصولنا على التوقيع والموافقة الصريحة للمؤلف على السعر النهائي ونسب المبيعات.</p>
            </div>

          </div>

          {/* Left Column: Form & Action Panel */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              
              {!formSubmitted ? (
                // Step 1: Manuscript Submission Form
                <motion.div 
                  key="step-submit"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 md:p-8 rounded-lg border border-stone-200 shadow-md"
                >
                  <h3 className="text-xl font-serif font-bold text-brand-900 mb-6 pb-3 border-b border-stone-150">
                    تقديم طلب نشر مصنف جديد
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-5 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">الاسم الكامل للمؤلف *</label>
                        <input 
                          type="text" 
                          required
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="الاسم واللقب"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">البريد الإلكتروني *</label>
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="yourname@example.com"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold text-right"
                          dir="ltr"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">رقم الهاتف للاتصال المباشر *</label>
                        <input 
                          type="tel" 
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="مثال: 0660000000"
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold text-right"
                          dir="ltr"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-500 mb-1">مجال / تصنيف الكتاب الرئيسي *</label>
                        <select 
                          value={bookCategory}
                          onChange={(e) => setBookCategory(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold cursor-pointer"
                        >
                          <option value="ادب">كتب أدب ورواية</option>
                          <option value="جامعي">كتب جامعية وأكاديمية</option>
                          <option value="قانون">كتب القانون والعلوم السياسية</option>
                          <option value="اقتصاد">كتب الاقتصاد والتسيير</option>
                          <option value="شريعة">علوم الشريعة والدين</option>
                          <option value="مدرسي">كتب مدرسية وشبه مدرسية</option>
                          <option value="بكالوريا">بكالوريات وحوليات</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">العنوان المقترح للمصنف *</label>
                      <input 
                        type="text" 
                        required
                        value={bookTitle}
                        onChange={(e) => setBookTitle(e.target.value)}
                        placeholder="أدخل عنوان الكتاب بوضوح"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">ملخص مكثف عن فكرة ومحتوى المصنف *</label>
                      <textarea 
                        required
                        rows={4}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="ماذا يتناول الكتاب؟ وما هي القيمة العلمية أو الأدبية المضافة للساحة؟"
                        className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">رفع مسودة المخطوط (جزء أو المخطوط الكامل) *</label>
                      <div className="border-2 border-dashed border-stone-200 rounded-lg p-5 flex flex-col items-center justify-center text-stone-500 bg-stone-50 hover:bg-stone-100/50 transition-colors cursor-pointer relative">
                        <input 
                          type="file" 
                          required={!uploadedFile}
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" 
                        />
                        <Upload size={24} className="text-stone-400 mb-1.5" />
                        <span className="text-xs font-semibold text-stone-600">
                          {uploadedFile ? uploadedFile.name : "اضغط لاختيار المخطوط أو سحبه هنا"}
                        </span>
                        <span className="text-[10px] text-stone-400 mt-1">يُقبل Word أو PDF (حتى 20 ميغابايت)</span>
                      </div>
                      {uploadProgress > 0 && (
                        <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className="bg-accent-gold h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                        </div>
                      )}
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-brand-900 hover:bg-brand-850 text-white font-bold py-3 px-6 rounded shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    >
                      <Send size={16} />
                      <span>إرسال المخطوط وبدء التقييم والتسعير</span>
                    </button>
                  </form>
                </motion.div>
              ) : !pricingApproved ? (
                // Step 2: Simulated Price Agreement & Author Approval Panel
                <motion.div 
                  key="step-agreement"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white p-6 md:p-8 rounded-lg border-2 border-accent-gold shadow-xl"
                >
                  <div className="flex items-center gap-3 mb-6 border-b border-stone-150 pb-4">
                    <div className="w-10 h-10 rounded-full bg-accent-gold flex items-center justify-center text-brand-900">
                      <FileCheck2 size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-serif font-bold text-brand-900">وثيقة تقييم وتحديد سعر المصنف</h3>
                      <p className="text-xs text-stone-500">تم مراجعة مخطط "{bookTitle}" وحساب عرض التسعير</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-250 text-amber-950 p-4 rounded text-xs leading-relaxed mb-6 space-y-1">
                    <p className="font-bold flex items-center gap-1"><AlertCircle size={14} /> خطوة مراجعة السعر الإلزامية للمؤلف</p>
                    <p>المؤلف الفاضل، قبل أن نباشر في أعمال التدقيق والطباعة، يرجى مراجعة تفاصيل التسعير والعمولات المترتبة أدناه. موافقتك الرقمية ضرورية جداً لبدء العمل.</p>
                  </div>

                  {/* Calculated Price Details */}
                  <div className="space-y-4 text-sm mb-6 bg-stone-50 p-5 rounded border border-stone-150">
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500">اسم الكاتب:</span>
                      <span className="font-bold text-stone-800">{authorName}</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500">المصنف المقترح:</span>
                      <span className="font-bold text-stone-800">"{bookTitle}"</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500">عدد الصفحات المتفق عليها:</span>
                      <span className="font-bold text-stone-800">{pageCount} صفحة</span>
                    </div>
                    <div className="flex justify-between border-b border-stone-200 pb-2">
                      <span className="text-stone-500">سعر البيع المقترح للمكتبات والجمهور:</span>
                      <span className="font-bold text-brand-900 text-base">{retailPrice} د.ج</span>
                    </div>
                    <div className="flex justify-between text-brand-900 font-bold bg-white p-3 rounded border border-stone-200">
                      <span className="flex items-center gap-1">أرباح المؤلف الصافية (10% من المبيعات):</span>
                      <span className="text-accent-gold text-base">{royaltyPerSale} د.ج عن كل نسخة مباعة</span>
                    </div>
                  </div>

                  {/* Formal Electronic Signature Form */}
                  <form onSubmit={handleApproveQuote} className="space-y-4">
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle size={16} />
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-stone-500 mb-1">
                        اكتب اسمك الثلاثي للموافقة والتعاقد إلكترونياً *
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          disabled={isSubmitting}
                          placeholder="الاسم الكامل بخط اليد"
                          className="w-full p-2.5 pl-10 bg-stone-50 border border-stone-200 rounded text-sm focus:bg-white focus:outline-none focus:border-accent-gold font-serif text-brand-900 font-bold disabled:opacity-60"
                        />
                        <Signature className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
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
                        أوافق بصفتي الكاتب والمؤلف الشرعي على المخطوط وعرض الأسعار المقترح والنسب المالية المحددة أعلاه، وأفوض دار المتنبي للبدء في تنسيق الكتاب وتدقيقه لغوياً تمهيداً للنشر.
                      </label>
                    </div>

                    <div className="flex gap-4 pt-3">
                      <button 
                        type="button"
                        onClick={() => { setFormSubmitted(false); }}
                        disabled={isSubmitting}
                        className="flex-1 py-3 text-stone-600 border border-stone-200 rounded hover:bg-stone-50 font-bold transition-all text-xs text-center disabled:opacity-55"
                      >
                        تعديل تفاصيل المخطوط
                      </button>
                      
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3 bg-brand-900 text-white rounded font-bold hover:bg-brand-850 flex items-center justify-center gap-2 transition-all shadow-md text-xs cursor-pointer disabled:bg-stone-400 disabled:cursor-not-allowed"
                      >
                        <Signature size={14} className={isSubmitting ? "animate-pulse" : ""} />
                        <span>{isSubmitting ? "جاري توقيع وحفظ العقد..." : "اعتماد السعر وتوقيع العقد"}</span>
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                // Step 3: Confirmation and Next Steps
                <motion.div 
                  key="step-final"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-lg border border-green-200 shadow-xl text-center space-y-6"
                >
                  <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle size={36} />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-serif font-bold text-brand-900">تم توقيع العقد واعتماد السعر بنجاح</h3>
                    <p className="text-stone-500 text-sm">أهلاً بك رسمياً كأحد كُتّاب دار المتنبي المميزين!</p>
                  </div>

                  <div className="bg-stone-50 p-4 rounded border border-stone-150 text-xs text-right space-y-2 max-w-md mx-auto">
                    <div><span className="text-stone-400">اسم الكاتب الموقّع:</span> <span className="font-bold text-stone-700">{signatureName}</span></div>
                    <div><span className="text-stone-400">اسم المصنف المعتمد:</span> <span className="font-bold text-stone-700">"{bookTitle}"</span></div>
                    <div><span className="text-stone-400">سعر البيع النهائي:</span> <span className="font-bold text-brand-900">{retailPrice} د.ج</span></div>
                    <div><span className="text-stone-400">حالة الطلب الحالية:</span> <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">قيد التدقيق اللغوي والتنسيق</span></div>
                  </div>

                  <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed">
                    لقد قمنا بإرسال نسخة كاملة من العقد المبرم وتفاصيل التسعير إلى بريدك الإلكتروني <strong>{email}</strong>. سيقوم المحرر المسؤول بالتواصل معك عبر الهاتف للتنسيق.
                  </p>

                  <div className="pt-4 flex gap-4 justify-center">
                    <button 
                      onClick={() => {
                        setFormSubmitted(false);
                        setPricingApproved(false);
                        setSignatureName("");
                        setUploadedFile(null);
                        setUploadProgress(0);
                      }}
                      className="text-xs text-brand-900 font-bold border border-brand-900 px-6 py-2.5 rounded hover:bg-brand-900 hover:text-white transition-all"
                    >
                      تسجيل عمل آخر جديد
                    </button>
                    <button 
                      onClick={() => { window.print(); }}
                      className="text-xs text-stone-600 font-bold border border-stone-200 px-6 py-2.5 rounded hover:bg-stone-50 transition-all"
                    >
                      طباعة نسخة العقد
                    </button>
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
