import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');
code = code.replace("\\\\n      totalPrintCost:", "\\n      totalPrintCost:");
fs.writeFileSync('src/pages/Admin.tsx', code);
