import fs from 'fs';
let adminBooksCode = fs.readFileSync('src/components/admin/AdminBooks.tsx', 'utf-8');
adminBooksCode = adminBooksCode.replace(
  'reader.readAsDataURL(file);',
  'reader.readAsDataURL(file as unknown as Blob);'
);
fs.writeFileSync('src/components/admin/AdminBooks.tsx', adminBooksCode);
