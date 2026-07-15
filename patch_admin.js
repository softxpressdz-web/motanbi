import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// Update state to include new fields
code = code.replace(
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '' });",
  "const [manuscriptForm, setManuscriptForm] = useState({ status: '', retailPrice: '', productionCostPerBook: '', pageCount: 0, coverType: 'paperback', printCopies: 0 });"
);

code = code.replace(
  /setManuscriptForm\(\{\n\s*status: sub\.status \|\| 'submitted',\n\s*retailPrice: sub\.retailPrice \|\| '', productionCostPerBook: sub\.productionCostPerBook \|\| ''\n\s*\}\);/g,
  `setManuscriptForm({
      status: sub.status || 'submitted',
      retailPrice: sub.retailPrice || '', 
      productionCostPerBook: sub.productionCostPerBook || '',
      pageCount: sub.pageCount || 150,
      coverType: sub.coverType || 'paperback',
      printCopies: sub.printCopies || 1000
    });`
);

code = code.replace(
  /body: JSON\.stringify\(\{[\s\S]*?\}\)/,
  `body: JSON.stringify({
          status: manuscriptForm.status,
          retailPrice: manuscriptForm.retailPrice,
          productionCostPerBook: manuscriptForm.productionCostPerBook,
          pageCount: manuscriptForm.pageCount,
          coverType: manuscriptForm.coverType,
          printCopies: manuscriptForm.printCopies,
          totalPrintCost: (parseFloat(manuscriptForm.productionCostPerBook || "0") * manuscriptForm.printCopies).toString()
        })`
);

// Add the extra fields to the form
const formHtml = `{isEditingManuscript ? (
                    <div className="p-4 bg-stone-100 border-t border-stone-200 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">عدد الصفحات</label>
                          <input 
                            type="number"
                            value={manuscriptForm.pageCount}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, pageCount: parseInt(e.target.value) || 0})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">نوع الغلاف</label>
                          <select 
                            value={manuscriptForm.coverType}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, coverType: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          >
                            <option value="paperback">ورقي عادي</option>
                            <option value="hardcover">مجلد فني</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">عدد النسخ</label>
                          <input 
                            type="number"
                            value={manuscriptForm.printCopies}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, printCopies: parseInt(e.target.value) || 0})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">حالة المخطوط</label>
                          <select 
                            value={manuscriptForm.status}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, status: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-brand-900"
                          >
                            <option value="pending_review">تم الإيداع (قيد المراجعة)</option>
                            <option value="awaiting_author_approval">في انتظار موافقة المؤلف (العرض جاهز)</option>
                            <option value="contract_signed">تم توقيع العقد</option>
                            <option value="in_review">قيد التحرير والمراجعة</option>
                            <option value="printed">جاهز / مطبوع</option>
                          </select>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">تكلفة الإنتاج (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.productionCostPerBook}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, productionCostPerBook: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="مثال: 500"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <label className="block text-xs font-bold text-stone-700 mb-1.5">سعر البيع النهائي (د.ج)</label>
                          <input 
                            type="number"
                            value={manuscriptForm.retailPrice}
                            onChange={(e) => setManuscriptForm({...manuscriptForm, retailPrice: e.target.value})}
                            className="w-full border border-stone-300 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-900"
                            placeholder="مثال: 1200"
                          />
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <button 
                            onClick={handleSaveManuscript}
                            disabled={isUpdatingManuscript}
                            className="bg-brand-900 text-white px-4 py-2 rounded text-sm font-bold hover:bg-brand-850 disabled:opacity-50"
                          >
                            {isUpdatingManuscript ? "جاري الحفظ..." : "حفظ"}
                          </button>
                          <button 
                            onClick={() => setIsEditingManuscript(false)}
                            className="bg-stone-300 text-stone-700 px-4 py-2 rounded text-sm font-bold hover:bg-stone-400"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-between items-center print:hidden">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-700">الحالة:</span>
                        <span className="px-3 py-1 bg-white border border-stone-200 rounded text-xs font-bold text-brand-900">
                          {selectedManuscript.status === 'contract_signed' ? 'تم توقيع العقد' : 
                           selectedManuscript.status === 'in_review' ? 'قيد التحرير' : 
                           selectedManuscript.status === 'printed' ? 'جاهز ومطبوع' : 
                           selectedManuscript.status === 'awaiting_author_approval' ? 'في انتظار موافقة المؤلف' : 
                           'قيد المراجعة'}
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsEditingManuscript(true)}
                        className="bg-stone-800 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-stone-900"
                      >
                        تعديل الحالة والسعر
                      </button>
                    </div>
                  )}`;

code = code.replace(
  /\{isEditingManuscript \? \([\s\S]*?\)\s*:\s*\([\s\S]*?\}\s*<\/div>\s*\)\}/,
  formHtml
);

fs.writeFileSync('src/pages/Admin.tsx', code);
