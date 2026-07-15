import React from 'react';
import { ShieldCheck, BookOpen, PenTool, CheckCircle } from 'lucide-react';

export function PublishingPolicy() {
  return (
    <div className="bg-stone-50 min-h-screen py-16" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-900 mb-6">سياسة النشر</h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            نلتزم في دار المتنبي للطباعة والنشر بتقديم محتوى ذي قيمة علمية وثقافية عالية، وفق معايير مهنية وأخلاقية صارمة.
          </p>
        </div>

        <div className="space-y-12 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-stone-100">
          
          {/* Section 1 */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 mt-1">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-4">المعايير العامة للنشر</h2>
              <ul className="space-y-3 text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>أن يكون العمل أصيلاً ولم يسبق نشره بأي شكل من الأشكال (ورقياً أو إلكترونياً).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>أن يلتزم العمل بقواعد اللغة العربية (أو اللغة المكتوب بها) من حيث النحو والصرف والإملاء.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>أن لا يتضمن العمل ما يتعارض مع القيم والمبادئ الأخلاقية للمجتمع، أو ما يمس بالثوابت الوطنية والدينية.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>أن يتسم المحتوى بالرصانة العلمية والموضوعية (بالنسبة للكتب الأكاديمية والبحثية).</span>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Section 2 */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 mt-1">
              <PenTool size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-4">حقوق الملكية الفكرية</h2>
              <ul className="space-y-3 text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>يتحمل المؤلف المسؤولية القانونية والأخلاقية الكاملة عن محتوى كتابه، ويقر بأن العمل من إنتاجه الخالص.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>في حال وجود اقتباسات أو نصوص أو صور تعود للغير، يجب على المؤلف الإشارة إليها بوضوح في الهوامش أو قائمة المراجع.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>تحتفظ دار المتنبي بالحق في إلغاء عقد النشر ومتابعة المؤلف قانونياً في حال ثبوت انتحال أو سرقة علمية.</span>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Section 3 */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-brand-50 rounded-full flex items-center justify-center text-brand-900 mt-1">
              <BookOpen size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-4">إجراءات التحكيم والمراجعة</h2>
              <ul className="space-y-3 text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>تخضع جميع المخطوطات الأكاديمية والجامعية للتحكيم العلمي من قبل متخصصين لتقييم جودتها.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>تحتفظ الدار بحق رفض أي عمل لا يتماشى مع خطها التحريري أو لا يرقى للمستوى المطلوب، دون إبداء الأسباب في بعض الحالات.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>قد يُطلب من المؤلف إجراء بعض التعديلات أو الإضافات بناءً على تقرير لجان القراءة والمراجعة.</span>
                </li>
              </ul>
            </div>
          </section>

          <hr className="border-stone-100" />

          {/* Section 4 */}
          <section className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
            <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mt-1">
              <CheckCircle size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold text-brand-900 mb-4">الحقوق المالية والمادية</h2>
              <ul className="space-y-3 text-stone-600 leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>تُحدد الحقوق المالية للمؤلف ونسب الأرباح وطريقة الدفع في العقد المبرم بين الطرفين (بشكل عام يمنح المؤلف نسبة محددة من الأرباح).</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-gold mt-1">•</span>
                  <span>يحصل المؤلف على عدد محدد من النسخ المجانية بعد صدور الكتاب، يتم الاتفاق عليها مسبقاً في عقد النشر.</span>
                </li>
              </ul>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
