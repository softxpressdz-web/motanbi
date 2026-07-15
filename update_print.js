import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// Update the rendering of signed contract to include a print button
const oldSignedStatus = `{item.status === "contract_signed" && (
                              <div className="text-xs text-stone-600 bg-emerald-50/50 rounded-lg p-3 border border-emerald-100">
                                <p className="font-bold text-emerald-800 flex items-center gap-1">
                                  <CheckCircle2 size={14} className="text-emerald-600" />
                                  <span>اتفاقية النشر الافتراضية سارية العمل</span>
                                </p>
                                <p className="mt-1 leading-relaxed">
                                  تم توقيع العقد قانونياً بواسطة المؤلف <strong className="text-stone-800">{item.signatureName}</strong>. 
                                  النسخة المرسلة للمخطوطة (<code className="text-stone-700 font-mono text-[10px] bg-white px-1 border rounded">{item.uploadedFileName}</code>) تم إحالتها للتدقيق والمطابقة. سنتواصل معك هاتفياً على الرقم <strong className="text-stone-800 font-mono">{item.phone}</strong> فور الانتهاء.
                                </p>
                              </div>
                            )}`;

const newSignedStatus = `{item.status === "contract_signed" && (
                              <div className="text-xs text-stone-600 bg-emerald-50/50 rounded-lg p-3 border border-emerald-100 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                  <p className="font-bold text-emerald-800 flex items-center gap-1">
                                    <CheckCircle2 size={14} className="text-emerald-600" />
                                    <span>اتفاقية النشر الافتراضية سارية العمل</span>
                                  </p>
                                  <button
                                    onClick={() => setSigningManuscript(item)}
                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 font-bold flex items-center gap-1 transition-colors"
                                  >
                                    <Printer size={14} />
                                    <span>طباعة / تحميل العقد</span>
                                  </button>
                                </div>
                                <p className="leading-relaxed">
                                  تم توقيع العقد قانونياً بواسطة المؤلف <strong className="text-stone-800">{item.signatureName}</strong>. 
                                  النسخة المرسلة للمخطوطة (<code className="text-stone-700 font-mono text-[10px] bg-white px-1 border rounded">{item.uploadedFileName}</code>) تم إحالتها للتدقيق والمطابقة. سنتواصل معك هاتفياً على الرقم <strong className="text-stone-800 font-mono">{item.phone}</strong> فور الانتهاء.
                                </p>
                              </div>
                            )}`;

code = code.replace(oldSignedStatus, newSignedStatus);

fs.writeFileSync('src/pages/Profile.tsx', code);
