import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Add imports
code = code.replace(
  'import { Link } from "react-router";',
  'import { Link } from "react-router";\nimport html2pdf from "html2pdf.js";'
);

code = code.replace(
  'import {',
  'import {\n  Printer, X,'
);

// Add state
const stateBlock = `  const [manuscripts, setManuscripts] = useState<any[]>([]);
  const [isLoadingManuscripts, setIsLoadingManuscripts] = useState(false);
  
  // Manuscript Signing State
  const [signingManuscript, setSigningManuscript] = useState<any>(null);
  const [signatureName, setSignatureName] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);`;

code = code.replace(
  /const \[manuscripts, setManuscripts\] = useState<any\[\]>\(\[\]\);\n\s*const \[isLoadingManuscripts, setIsLoadingManuscripts\] = useState\(false\);/,
  stateBlock
);

// Add signing function
const signFunc = `  const handleSignContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signingManuscript || !agreedTerms || !signatureName.trim()) return;
    
    setIsSigning(true);
    try {
      const res = await fetch(\`/api/manuscripts/\${signingManuscript.id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "contract_signed",
          signatureName: signatureName
        })
      });
      if (res.ok) {
        await fetchManuscripts();
        setSigningManuscript(null);
        setSignatureName("");
        setAgreedTerms(false);
      }
    } catch (e) {
      console.error("Failed to sign contract", e);
    } finally {
      setIsSigning(false);
    }
  };
  
  const handlePrintContract = () => {
    const element = document.getElementById('contract-print-area');
    if (element) {
      element.classList.remove('hidden');
      element.classList.remove('print:block');
      
      const opt = {
        margin:       10,
        filename:     \`contract_\${signingManuscript?.bookTitle || 'author'}.pdf\`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      html2pdf().from(element).set(opt).save().then(() => {
        element.classList.add('hidden');
        element.classList.add('print:block');
      });
    }
  };
`;

code = code.replace(
  /const handleSubmitProfile = async \(e: React\.FormEvent\) => \{/,
  signFunc + '\n  const handleSubmitProfile = async (e: React.FormEvent) => {'
);

// Replace the manuscript map rendering
const manuscriptRender = `{manuscripts.map((item) => {
                        const statusObj = getSubmissionStatusLabel(item.status);
                        const dateText = item.createdAt ? new Date(item.createdAt).toLocaleDateString("ar-DZ") : "غير متوفر";

                        return (
                          <div 
                            key={item.id} 
                            className="p-5 border border-stone-150 rounded-xl bg-white shadow-sm space-y-4"
                          >
                            <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                              <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-brand-50 text-brand-900 rounded-full flex items-center justify-center shrink-0">
                                  <BookOpen size={18} />
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-brand-900">{item.bookTitle}</h4>
                                  <p className="text-xs text-stone-500 mt-0.5">قسم: {item.bookCategory} | تقديم بتاريخ: {dateText}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <span className={\`text-[10px] font-bold px-2.5 py-1 rounded-full border \${statusObj.color || "bg-stone-50 text-stone-700"}\`}>
                                  {statusObj.label}
                                </span>
                                {item.status === "awaiting_author_approval" && (
                                  <button
                                    onClick={() => setSigningManuscript(item)}
                                    className="text-xs bg-brand-900 text-white px-3 py-1.5 rounded hover:bg-brand-850 font-bold"
                                  >
                                    مراجعة العرض وتوقيع العقد
                                  </button>
                                )}
                              </div>
                            </div>

                            {(item.status === "awaiting_author_approval" || item.status === "contract_signed" || item.status === "printed" || item.status === "in_review") && (
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
                            )}

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
                      })}`;

code = code.replace(
  /\{manuscripts\.map\(\(item\) => \{[\s\S]*?\}\)\}\s*<\/div>\s*\)\}/,
  manuscriptRender + '\n                    </div>\n                  )}'
);

// Add the signing modal at the end of the file
const signingModal = `
      {/* Signing Modal */}
      {signingManuscript && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="bg-brand-900 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-serif font-bold text-lg">عرض الطباعة وعقد النشر</h3>
              <button onClick={() => setSigningManuscript(null)} className="text-white hover:text-stone-300">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div id="contract-print-area" className="hidden print:block text-black text-sm text-justify pt-8 pb-12 w-full max-w-4xl mx-auto bg-white absolute inset-0 z-50 p-8" dir="rtl">
                {/* Same contract as Admin */}
                <div className="text-center mb-8 border-b-2 border-stone-800 pb-8">
                  <h2 className="text-2xl font-bold font-serif mb-2">عقد طباعة ونشر وتوزيع</h2>
                  <p className="text-stone-600">رقم المخطوط: {signingManuscript.id} | التاريخ: {new Date().toLocaleDateString("ar-DZ")}</p>
                </div>
                <p className="mb-6">إنه في يوم <strong>{new Date().toLocaleDateString("ar-DZ")}</strong>، تم الاتفاق بين كل من:</p>
                <div className="mb-6 space-y-2">
                  <p><strong>الطرف الأول (الناشر):</strong> دار المتنبي للطباعة والنشر والتوزيع، ومقرها المسيلة، ويمثلها السيد نصر خشاب بصفته المدير العام.</p>
                  <p><strong>الطرف الثاني (المؤلف):</strong> السيد(ة) <strong>{signingManuscript.authorName}</strong>، ورقم هاتفه: <strong>{signingManuscript.phone}</strong>.</p>
                </div>
                <p className="mb-6">حيث أن الطرف الثاني قد ألف كتاباً بعنوان: <strong>"{signingManuscript.bookTitle}"</strong> (والذي سيشار إليه لاحقاً بـ "الكتاب")، ويرغب في طباعته ونشره وتوزيعه، فقد التقت إرادة الطرفين على إبرام هذا العقد وفقاً للشروط والبنود التالية:</p>
                
                <p className="font-bold mb-2 text-lg">البند الأول: موضوع العقد</p>
                <p className="mb-6">يتنازل الطرف الثاني بموجب هذا العقد للطرف الأول عن حق طباعة ونشر وتوزيع الكتاب المذكور أعلاه ({signingManuscript.pageCount} صفحة، غلاف {signingManuscript.coverType === 'hardcover' ? 'مجلد فني' : 'ورقي'}) باللغة العربية داخل الجزائر وخارجها.</p>

                <p className="font-bold mb-2 text-lg">البند الثاني: ضمانات المؤلف</p>
                <p className="mb-6">يضمن الطرف الثاني أن الكتاب هو من تأليفه الأصلي ولم يسبق نشره، وأنه لا يحتوي على أي مواد تخرق حقوق الطبع والنشر أو القوانين المعمول بها، ويتحمل المسؤولية القانونية الكاملة عن محتوى الكتاب.</p>

                <p className="font-bold mb-2 text-lg">البند الثالث: التزامات الناشر</p>
                <p className="mb-2">يتعهد ويلتزم الناشر بما يلي:</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- يتولى الناشر تدقيق المخطوطة لغويا وإملائيا وتنسيقها حسب المعايير المطلوبة.</li>
                  <li>2- يتولى الناشر استخراج الرقم المعياري الدولي للكتاب ISBN مع إيداع الكتاب لدى المكتبة الوطنية.</li>
                  <li>3- يتولى الناشر تصميم غلاف الكتاب حسب الموضوع أو المحتوى.</li>
                  <li>4- يتولى الناشر طباعة الكتاب طباعة فاخرة حسب المواصفات المتفق عليها بطبعة أولى عدد نسخها ({signingManuscript.printCopies} نسخة).</li>
                  <li>5- يتحمل الناشر جميع تكاليف التدقيق اللغوي، الإخراج والتنسيق وتصميم الغلاف، مع استخراج الإيداع القانوني والرقم المعياري وتكاليف الطباعة والتوزيع والتسويق دون مطالبة المؤلف بأية مساهمات مالية في ذلك، إلا في الحالات الاستثنائية التي يتم الاتفاق عليها.</li>
                  <li>6- يتولى الناشر التسويق للكتاب عن طريق الصفحات الخاصة بالدار في مواقع التواصل الاجتماعي وفي الموقع الرسمي للدار، ويعرضه في المعارض الوطنية والدولية وفي المكتبات ونقاط البيع الخاصة بالدار.</li>
                  <li>7- يتولى الناشر تزويد المؤلف بتقارير المبيعات الخاصة بالكتاب في آجال يتم الاتفاق عليها.</li>
                  <li>8- يحق للناشر ترجمة الكتاب كليا أو جزئيا في أي لغة أخرى بعد أخذ الموافقة الخطية من المؤلف وخلال مدة العقد.</li>
                  <li>9- يقدم الناشر للمؤلف التصميم النهائي للكتاب وعلى المؤلف إرسال الموافقة الخطية للناشر في غضون أسبوع من الاستلام.</li>
                </ul>

                <p className="font-bold mb-2 text-lg">البند الرابع: التزامات المؤلف</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- يكون على المؤلف مراجعة وتصحيح الكتاب المسلم إليه وإعادته إلى الناشر خلال أسبوعين.</li>
                  <li>2- لا يحق للمؤلف طوال مدة العقد منح حق نشر وتوزيع وترجمة الكتاب لأي جهة أخرى إلا بعد أخذ موافقة الناشر.</li>
                  <li>3- يمنع على المؤلف تحميل وإتاحة النسخة الالكترونية للكتاب على مواقع التواصل الاجتماعي وكل ما يتعلق بالتحميل المجاني عدا الغلاف وفهرس الكتاب.</li>
                </ul>

                <p className="font-bold mb-2 text-lg">البند الخامس: الحقوق المالية</p>
                <ul className="list-none space-y-2 mb-6 pr-4">
                  <li>1- يعود للمؤلف ما نسبته 10% من سعر بيع الكتاب بالجملة. (أرباحك المقدرة: {signingManuscript.royaltyPerSale} د.ج للنسخة)</li>
                  <li>2- تجري المحاسبة بعد بيع 100 نسخة من الكتاب.</li>
                </ul>

                <p className="mb-6"><strong>البند السادس: مدة العقد</strong><br/>مدة هذا العقد 05 سنوات بدءا من تاريخ تحريره.</p>

                <p className="font-bold mb-2 text-lg">البند السابع: الإنهاء</p>
                <p className="mb-8">للناشر الحق في إنهاء هذا العقد في حالة إخفاق المؤلف في أداء أي من التزاماته وفي حالة عدم إجازة الكتاب من قبل لجان دار النشر.</p>

                <div className="flex justify-between items-start pt-8 pb-16 px-12 border-t-2 border-stone-800">
                  <div className="text-center">
                    <p className="font-bold mb-16 text-lg">الطرف الأول: الناشر</p>
                    <p className="font-bold">دار المتنبي للطباعة والنشر</p>
                    <p className="text-sm">المدير العام: نصر خشاب</p>
                    <p className="mt-8 text-stone-400 italic">موقع إلكترونياً</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold mb-16 text-lg">الطرف الثاني: المؤلف</p>
                    <p className="font-bold">{signingManuscript.authorName}</p>
                    <p className="mt-8 text-stone-400 italic">موقع إلكترونياً بـ "{signatureName || '......'}"</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
                <h4 className="font-bold text-brand-900 mb-4 text-lg">التفاصيل المالية المتفق عليها</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-stone-500">نوع الغلاف</p>
                    <p className="font-bold text-stone-800">{signingManuscript.coverType === 'hardcover' ? 'مجلد فني' : 'ورقي عادي'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">عدد الصفحات</p>
                    <p className="font-bold text-stone-800">{signingManuscript.pageCount} صفحة</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">عدد نسخ الطبعة</p>
                    <p className="font-bold text-stone-800">{signingManuscript.printCopies} نسخة</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">سعر البيع المقترح</p>
                    <p className="font-bold text-brand-900">{parseFloat(signingManuscript.retailPrice || '0').toLocaleString()} د.ج</p>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-white rounded border border-blue-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-stone-700">حقوقك المالية عن كل نسخة مباعة (10%):</span>
                  <span className="text-lg font-black text-accent-gold">{parseFloat(signingManuscript.royaltyPerSale || '0').toLocaleString()} د.ج</span>
                </div>
              </div>

              <div className="border border-stone-200 rounded-lg p-5">
                <h4 className="font-bold text-brand-900 mb-4">توقيع العقد إلكترونياً</h4>
                <form onSubmit={handleSignContract} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">اكتب اسمك الكامل للمصادقة على التوقيع:</label>
                    <input 
                      type="text" 
                      required
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full md:w-1/2 p-3 border border-stone-300 rounded focus:outline-none focus:border-brand-900"
                      placeholder="الاسم واللقب..."
                    />
                  </div>
                  <div className="flex items-start gap-2 py-2">
                    <input 
                      type="checkbox" 
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      id="agree_final"
                      className="rounded text-accent-gold focus:ring-accent-gold w-4 h-4 mt-1"
                    />
                    <label htmlFor="agree_final" className="text-sm text-stone-600 leading-relaxed cursor-pointer select-none">
                      أقر أنا الموقع أعلاه، بصفتي المؤلف الشرعي للكتاب، بموافقتي التامة على بنود العقد الموضحة، وعلى الشروط والتفاصيل المالية المقدمة من دار المتنبي للطباعة والنشر.
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-stone-100">
                    <button 
                      type="submit"
                      disabled={!agreedTerms || !signatureName.trim() || isSigning}
                      className="flex-1 bg-brand-900 text-white py-3 rounded-lg font-bold hover:bg-brand-850 disabled:opacity-50 transition-colors"
                    >
                      {isSigning ? "جاري توقيع العقد..." : "تأكيد ومصادقة إلكترونية"}
                    </button>
                    <button 
                      type="button"
                      onClick={handlePrintContract}
                      className="px-6 py-3 border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      <span>معاينة للطباعة</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}`;

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*\}/, signingModal);

fs.writeFileSync('src/pages/Profile.tsx', code);
