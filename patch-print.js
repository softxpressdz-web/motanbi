import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// import html2pdf
if (!code.includes("import html2pdf from")) {
  code = code.replace('import React', 'import html2pdf from "html2pdf.js";\nimport React');
}

// add ID to print area
code = code.replace(
  '<div className="hidden print:block text-black text-sm text-justify pt-8 pb-12 w-full max-w-4xl mx-auto bg-white absolute inset-0 z-50 p-8" dir="rtl">',
  '<div id="contract-print-area" className="hidden print:block text-black text-sm text-justify pt-8 pb-12 w-full max-w-4xl mx-auto bg-white absolute inset-0 z-50 p-8" dir="rtl">'
);

// replace window.print()
const printLogic = `
                    const element = document.getElementById('contract-print-area');
                    if (element) {
                      element.classList.remove('hidden');
                      element.classList.remove('print:block');
                      
                      const opt = {
                        margin:       10,
                        filename:     \`contract_\${selectedManuscript.bookTitle}.pdf\`,
                        image:        { type: 'jpeg', quality: 0.98 },
                        html2canvas:  { scale: 2, useCORS: true },
                        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
                      };
                      
                      html2pdf().from(element).set(opt).save().then(() => {
                        element.classList.add('hidden');
                        element.classList.add('print:block');
                      });
                    }
`;
code = code.replace('onClick={() => { window.print(); }}', 'onClick={() => {' + printLogic + '}}');

fs.writeFileSync('src/pages/Admin.tsx', code);
