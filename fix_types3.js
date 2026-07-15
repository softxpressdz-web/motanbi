import fs from 'fs';

let profileCode = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');
profileCode = profileCode.replace(
  "jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }",
  "jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }"
);
fs.writeFileSync('src/pages/Profile.tsx', profileCode);

let adminBooksCode = fs.readFileSync('src/components/admin/AdminBooks.tsx', 'utf-8');
adminBooksCode = adminBooksCode.replace(
  'await uploadBytes(fileRef, coverFile as Blob);',
  'await uploadBytes(fileRef, coverFile as any);'
);
fs.writeFileSync('src/components/admin/AdminBooks.tsx', adminBooksCode);

