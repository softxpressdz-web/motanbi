import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Replace the grid for manuscript item in Profile
const oldGrid = `<div className="space-y-0.5 last:border-l-0">
                                  <p className="text-[10px] text-stone-500">سعر البيع المقترح</p>
                                  <p className="text-xs font-bold text-stone-800">{parseFloat(item.retailPrice || "0").toLocaleString()} د.ج</p>
                                </div>`;
const newGrid = `<div className="space-y-0.5 border-l border-stone-200 last:border-l-0">
                                  <p className="text-[10px] text-stone-500">سعر البيع المقترح</p>
                                  <p className="text-xs font-bold text-stone-800">{parseFloat(item.retailPrice || "0").toLocaleString()} د.ج</p>
                                </div>
                                <div className="space-y-0.5 last:border-l-0">
                                  <p className="text-[10px] text-stone-500">تكلفة الإنتاج الإجمالية</p>
                                  <p className="text-xs font-bold text-brand-900">{parseFloat(item.totalPrintCost || "0").toLocaleString()} د.ج</p>
                                </div>`;

code = code.replace(oldGrid, newGrid);
code = code.replace(oldGrid, newGrid); // Just in case it's there twice or I missed it

// Replace in the Modal financial details
const oldModalGrid = `<div>
                    <p className="text-xs text-stone-500">سعر البيع المقترح</p>
                    <p className="font-bold text-brand-900">{parseFloat(signingManuscript.retailPrice || '0').toLocaleString()} د.ج</p>
                  </div>`;
const newModalGrid = `<div>
                    <p className="text-xs text-stone-500">سعر البيع المقترح</p>
                    <p className="font-bold text-brand-900">{parseFloat(signingManuscript.retailPrice || '0').toLocaleString()} د.ج</p>
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">تكلفة الإنتاج الإجمالية</p>
                    <p className="font-bold text-brand-900">{parseFloat(signingManuscript.totalPrintCost || '0').toLocaleString()} د.ج</p>
                  </div>`;

code = code.replace(oldModalGrid, newModalGrid);

fs.writeFileSync('src/pages/Profile.tsx', code);
