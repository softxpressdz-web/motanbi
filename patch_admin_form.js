import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// 1. Update useState
code = code.replace(
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '', pageCount: 0, coverType: 'paperback', printCopies: 0 });",
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '', totalPrintCost: '', pageCount: 0, coverType: 'paperback', printCopies: 0 });"
);

// 2. Update handleEditManuscriptClick
code = code.replace(
  "productionCostPerBook: sub.productionCostPerBook || '',",
  "productionCostPerBook: sub.productionCostPerBook || '',\\n      totalPrintCost: sub.totalPrintCost || '',"
);

// 3. Update handleSaveManuscript
const oldBodyStr = `body: JSON.stringify({
          status: manuscriptForm.status,
          retailPrice: manuscriptForm.retailPrice,
          productionCostPerBook: manuscriptForm.productionCostPerBook,
          pageCount: manuscriptForm.pageCount,
          coverType: manuscriptForm.coverType,
          printCopies: manuscriptForm.printCopies,
          totalPrintCost: (parseFloat(manuscriptForm.productionCostPerBook || "0") * manuscriptForm.printCopies).toString()
        })`;

const newBodyStr = `body: JSON.stringify({
          status: manuscriptForm.status,
          retailPrice: manuscriptForm.retailPrice,
          productionCostPerBook: manuscriptForm.productionCostPerBook,
          pageCount: manuscriptForm.pageCount,
          coverType: manuscriptForm.coverType,
          printCopies: manuscriptForm.printCopies,
          totalPrintCost: manuscriptForm.totalPrintCost ? manuscriptForm.totalPrintCost : (parseFloat(manuscriptForm.productionCostPerBook || "0") * manuscriptForm.printCopies).toString()
        })`;
code = code.replace(oldBodyStr, newBodyStr);

// 4. Add the input field in the UI
const oldUI = `<div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">حالة المخطوط</label>`;

const newUI = `<div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">تكلفة الإنتاج الإجمالية (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.totalPrintCost}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, totalPrintCost: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="تلقائي..."
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">حالة المخطوط</label>`;

code = code.replace(oldUI, newUI);

fs.writeFileSync('src/pages/Admin.tsx', code);
