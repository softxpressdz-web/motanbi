import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// replace the handlePrintContract function
const oldFunc = `  const handlePrintContract = () => {
    const element = document.getElementById('contract-print-area');
    if (element) {
      const opt = {
        margin:       10,
        filename:     \`contract_\${signingManuscript?.bookTitle || 'author'}.pdf\`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      html2pdf().from(element).set(opt).save();
    }
  };`;

const newFunc = `  const handlePrintContract = async () => {
    const element = document.getElementById('contract-print-area');
    if (element) {
      const opt = {
        margin:       10,
        filename:     \`contract_\${signingManuscript?.bookTitle || 'author'}.pdf\`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      html2pdf().from(element).set(opt).save();
    }
  };`;

code = code.replace(oldFunc, newFunc);

// Also remove the static import
code = code.replace('import html2pdf from "html2pdf.js";\\n', '');

fs.writeFileSync('src/pages/Profile.tsx', code);
