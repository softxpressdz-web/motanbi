import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

const oldGrid = `<div>
                      <p className="text-stone-500 text-xs mb-1">تكلفة النسخة</p>
                      <p className="font-bold font-mono">{selectedManuscript.productionCostPerBook} د.ج</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">سعر البيع المقترح</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.retailPrice} د.ج</p>
                    </div>`;

const newGrid = `<div>
                      <p className="text-stone-500 text-xs mb-1">تكلفة النسخة</p>
                      <p className="font-bold font-mono">{selectedManuscript.productionCostPerBook} د.ج</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">تكلفة الإنتاج الإجمالية</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.totalPrintCost ? parseFloat(selectedManuscript.totalPrintCost).toLocaleString() : '0'} د.ج</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">سعر البيع المقترح</p>
                      <p className="font-bold font-mono text-brand-900">{selectedManuscript.retailPrice} د.ج</p>
                    </div>`;

code = code.replace(oldGrid, newGrid);
code = code.replace(
  'className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"',
  'className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4"'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
