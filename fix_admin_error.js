import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

code = code.replace(
  'productionCostPerBook: sub.productionCostPerBook || \\'\\',\\\\n      totalPrintCost: sub.totalPrintCost || \\'\\',',
  'productionCostPerBook: sub.productionCostPerBook || \\'\\',\\n      totalPrintCost: sub.totalPrintCost || \\'\\','
);

// wait let me just replace exactly what was written
fs.writeFileSync('src/pages/Admin.tsx', code);
