import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');
code = code.replace(
  "retailPrice: manuscriptForm.retailPrice",
  "retailPrice: manuscriptForm.retailPrice,\n          productionCostPerBook: manuscriptForm.productionCostPerBook"
);
fs.writeFileSync('src/pages/Admin.tsx', code);
