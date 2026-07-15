import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const oldButtons = `<button 
                      type="button"
                      onClick={handlePrintContract}
                      className="px-6 py-3 border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      <span>معاينة للطباعة</span>
                    </button>`;

const newButtons = `<button 
                      type="button"
                      onClick={() => window.print()}
                      className="px-6 py-3 border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-50 flex items-center justify-center gap-2"
                    >
                      <Printer size={18} />
                      <span>طباعة العقد</span>
                    </button>
                    <button 
                      type="button"
                      onClick={handlePrintContract}
                      className="px-6 py-3 bg-stone-800 rounded-lg font-bold text-white hover:bg-stone-700 flex items-center justify-center gap-2"
                    >
                      <Save size={18} />
                      <span>تحميل PDF</span>
                    </button>`;

code = code.replace(oldButtons, newButtons);
fs.writeFileSync('src/pages/Profile.tsx', code);
