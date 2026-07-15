import fs from 'fs';
let code = fs.readFileSync('src/pages/PublishBook.tsx', 'utf-8');

const newLabel = `<label htmlFor="agree_terms" className="text-xs text-stone-500 leading-normal cursor-pointer select-none">
                        أوافق بصفتي الكاتب والمؤلف الشرعي على المخطوط وعرض الأسعار المقترح والنسب المالية المحددة أعلاه، وأفوض دار المتنبي للبدء في تنسيق الكتاب وتدقيقه لغوياً تمهيداً للنشر. قرأت وأوافق على <a href="/publishing-policy" target="_blank" className="text-brand-900 underline">سياسة النشر</a>.
                      </label>`;

code = code.replace(
  /<label htmlFor="agree_terms" className="text-xs text-stone-500 leading-normal cursor-pointer select-none">[\s\S]*?<\/label>/,
  newLabel
);

fs.writeFileSync('src/pages/PublishBook.tsx', code);
