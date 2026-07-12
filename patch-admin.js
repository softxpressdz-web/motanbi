import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');
code = code.replace(
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '' });",
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '' });"
);
code = code.replace(
  "retailPrice: sub.retailPrice || ''",
  "retailPrice: sub.retailPrice || '', productionCostPerBook: sub.productionCostPerBook || ''"
);
code = code.replace(
  "retailPrice: manuscriptForm.retailPrice",
  "retailPrice: manuscriptForm.retailPrice, productionCostPerBook: manuscriptForm.productionCostPerBook"
);
fs.writeFileSync('src/pages/Admin.tsx', code);
