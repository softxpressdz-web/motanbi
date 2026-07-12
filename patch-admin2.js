import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

const replaceStr = `<div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">تكلفة الإنتاج (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.productionCostPerBook}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, productionCostPerBook: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="مثال: 500"
                          />
                        </div>
                        <div className="flex-1 w-full">`;

code = code.replace('<div className="flex-1 w-full">\n                          <label className="block text-xs font-bold text-stone-700 mb-1.5">سعر البيع النهائي', replaceStr + '\n                          <label className="block text-xs font-bold text-stone-700 mb-1.5">سعر البيع النهائي');
fs.writeFileSync('src/pages/Admin.tsx', code);
