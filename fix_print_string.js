import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const oldPrint = `  const handlePrintContract = async () => {
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

const newPrint = `  const handlePrintContract = async () => {
    const element = document.getElementById('contract-print-area');
    if (element) {
      const htmlContent = \`
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; direction: rtl; color: #000; line-height: 1.6; font-size: 16px; padding: 20px; }
              .text-center { text-align: center; }
              .mb-2 { margin-bottom: 8px; }
              .mb-6 { margin-bottom: 24px; }
              .mb-8 { margin-bottom: 32px; }
              .mb-16 { margin-bottom: 64px; }
              .mt-8 { margin-top: 32px; }
              .pb-8 { padding-bottom: 32px; }
              .pb-16 { padding-bottom: 64px; }
              .pt-8 { padding-top: 32px; }
              .px-12 { padding-left: 48px; padding-right: 48px; }
              .pr-4 { padding-right: 16px; }
              .border-b-2 { border-bottom: 2px solid; }
              .border-t-2 { border-top: 2px solid; }
              .border-stone-800 { border-color: #292524; }
              .font-bold { font-weight: bold; }
              .font-serif { font-family: 'Times New Roman', serif; }
              .text-2xl { font-size: 28px; }
              .text-lg { font-size: 20px; }
              .text-sm { font-size: 14px; }
              .text-stone-600 { color: #57534e; }
              .text-stone-400 { color: #a8a29e; }
              .italic { font-style: italic; }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-start { align-items: flex-start; }
              .space-y-2 > * + * { margin-top: 8px; }
              .list-none { list-style-type: none; padding: 0; margin: 0; }
            </style>
          </head>
          <body>
            \${element.innerHTML}
          </body>
        </html>
      \`;

      const opt = {
        margin:       10,
        filename:     \`contract_\${signingManuscript?.bookTitle || 'author'}.pdf\`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
      };
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default || html2pdfModule;
      html2pdf().from(htmlContent).set(opt).save();
    }
  };`;

code = code.replace(oldPrint, newPrint);

fs.writeFileSync('src/pages/Profile.tsx', code);
