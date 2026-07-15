import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  /case "submitted": return \{ label: "تم استلام الطلب", color: "bg-stone-100 text-stone-700" \};/,
  'case "submitted": return { label: "تم استلام الطلب", color: "bg-stone-100 text-stone-700" };\n      case "pending_review": return { label: "قيد المراجعة الإدارية", color: "bg-amber-50 text-amber-700 border-amber-200" };\n      case "awaiting_author_approval": return { label: "بانتظار موافقة المؤلف", color: "bg-blue-50 text-blue-700 border-blue-200" };'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
