import fs from 'fs';

// 1. Fix Profile.tsx image.type
let profileCode = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');
profileCode = profileCode.replace(
  "image:        { type: 'jpeg', quality: 0.98 },",
  "image:        { type: 'jpeg' as const, quality: 0.98 },"
);
fs.writeFileSync('src/pages/Profile.tsx', profileCode);

// 2. Fix booksData.ts Book interface
let booksDataCode = fs.readFileSync('src/lib/booksData.ts', 'utf-8');
if (!booksDataCode.includes('coverImage?: string;')) {
  booksDataCode = booksDataCode.replace(
    '  image: string;',
    '  image: string;\\n  coverImage?: string;'
  );
  fs.writeFileSync('src/lib/booksData.ts', booksDataCode);
}

// 3. Fix AdminBooks.tsx Blob cast
let adminBooksCode = fs.readFileSync('src/components/admin/AdminBooks.tsx', 'utf-8');
adminBooksCode = adminBooksCode.replace(
  'const fileRef = ref(storage, `books/${Date.now()}_${coverFile.name}`);',
  'const fileRef = ref(storage, `books/${Date.now()}_${(coverFile as File).name}`);'
);
adminBooksCode = adminBooksCode.replace(
  'await uploadBytes(fileRef, coverFile);',
  'await uploadBytes(fileRef, coverFile as Blob);'
);
fs.writeFileSync('src/components/admin/AdminBooks.tsx', adminBooksCode);
