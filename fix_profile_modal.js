import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  'id="contract-print-area" className="hidden print:block text-black text-sm text-justify pt-8 pb-12 w-full max-w-4xl mx-auto bg-white absolute inset-0 z-50 p-8" dir="rtl"',
  'id="contract-print-area" className="text-black text-sm text-justify p-6 md:p-10 w-full bg-white rounded-lg border border-stone-200 mb-6 shadow-sm" dir="rtl"'
);

// We should also fix the print function to download it as PDF if they click "تحميل PDF" and window.print() if they click "طباعة"
// Wait, html2pdf requires the element to be visible, since we are making it visible now, it will work.
code = code.replace(
  'element.classList.remove(\\\'hidden\\\');\\n      element.classList.remove(\\\'print:block\\\');',
  ''
);
code = code.replace(
  'element.classList.add(\\\'hidden\\\');\\n        element.classList.add(\\\'print:block\\\');',
  ''
);

fs.writeFileSync('src/pages/Profile.tsx', code);
