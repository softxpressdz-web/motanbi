import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

const oldModalBottom = `<div className="border border-stone-200 rounded-lg p-5 print:hidden">
                <h4 className="font-bold text-brand-900 mb-4">توقيع العقد إلكترونياً</h4>
                <form onSubmit={handleSignContract} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">اكتب اسمك الكامل للمصادقة على التوقيع:</label>
                    <input 
                      type="text" 
                      required
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      className="w-full md:w-1/2 p-3 border border-stone-300 rounded focus:outline-none focus:border-brand-900"
                      placeholder="الاسم واللقب..."
                    />
                  </div>
                  <div className="flex items-start gap-2 py-2">
                    <input 
                      type="checkbox" 
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      id="agree_final"
                      className="rounded text-accent-gold focus:ring-accent-gold w-4 h-4 mt-1"
                    />
                    <label htmlFor="agree_final" className="text-sm text-stone-600 leading-relaxed cursor-pointer select-none">
                      أقر أنا الموقع أعلاه، بصفتي المؤلف الشرعي للكتاب، بموافقتي التامة على بنود العقد الموضحة، وعلى الشروط والتفاصيل المالية المقدمة من دار المتنبي للطباعة والنشر.
                    </label>
                  </div>

                  <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-stone-100">
                    <button 
                      type="submit"
                      disabled={!agreedTerms || !signatureName.trim() || isSigning}
                      className="flex-1 bg-brand-900 text-white py-3 rounded-lg font-bold hover:bg-brand-850 disabled:opacity-50 transition-colors"
                    >
                      {isSigning ? "جاري توقيع العقد..." : "تأكيد ومصادقة إلكترونية"}
                    </button>
                    <button 
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
                    </button>
                  </div>
                </form>
              </div>`;

const newModalBottom = `<div className="border border-stone-200 rounded-lg p-5 print:hidden">
                {signingManuscript.status !== 'contract_signed' && signingManuscript.status !== 'printed' ? (
                  <>
                    <h4 className="font-bold text-brand-900 mb-4">توقيع العقد إلكترونياً</h4>
                    <form onSubmit={handleSignContract} className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-stone-700 mb-2">اكتب اسمك الكامل للمصادقة على التوقيع:</label>
                        <input 
                          type="text" 
                          required
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          className="w-full md:w-1/2 p-3 border border-stone-300 rounded focus:outline-none focus:border-brand-900"
                          placeholder="الاسم واللقب..."
                        />
                      </div>
                      <div className="flex items-start gap-2 py-2">
                        <input 
                          type="checkbox" 
                          required
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          id="agree_final"
                          className="rounded text-accent-gold focus:ring-accent-gold w-4 h-4 mt-1"
                        />
                        <label htmlFor="agree_final" className="text-sm text-stone-600 leading-relaxed cursor-pointer select-none">
                          أقر أنا الموقع أعلاه، بصفتي المؤلف الشرعي للكتاب، بموافقتي التامة على بنود العقد الموضحة، وعلى الشروط والتفاصيل المالية المقدمة من دار المتنبي للطباعة والنشر.
                        </label>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-stone-100">
                        <button 
                          type="submit"
                          disabled={!agreedTerms || !signatureName.trim() || isSigning}
                          className="flex-1 bg-brand-900 text-white py-3 rounded-lg font-bold hover:bg-brand-850 disabled:opacity-50 transition-colors"
                        >
                          {isSigning ? "جاري توقيع العقد..." : "تأكيد ومصادقة إلكترونية"}
                        </button>
                        <button 
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
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      type="button"
                      onClick={() => window.print()}
                      className="px-8 py-3 border-2 border-brand-900 rounded-lg font-bold text-brand-900 hover:bg-brand-50 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Printer size={20} />
                      <span>طباعة العقد</span>
                    </button>
                    <button 
                      type="button"
                      onClick={handlePrintContract}
                      className="px-8 py-3 bg-brand-900 rounded-lg font-bold text-white hover:bg-brand-850 flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-900/20"
                    >
                      <Save size={20} />
                      <span>تحميل نسخة PDF</span>
                    </button>
                  </div>
                )}
              </div>`;

code = code.replace(oldModalBottom, newModalBottom);

fs.writeFileSync('src/pages/Profile.tsx', code);
