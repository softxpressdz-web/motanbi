import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// I will just rewrite the function
const newPrintFunc = `  const handlePrintContract = () => {
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

// Use regex to replace the old handlePrintContract block
code = code.replace(/const handlePrintContract = \(\) => \{[\s\S]*?\n  \};\n/m, newPrintFunc + '\n');
fs.writeFileSync('src/pages/Profile.tsx', code);
