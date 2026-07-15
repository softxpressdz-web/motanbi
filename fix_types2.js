import fs from 'fs';
let booksDataCode = fs.readFileSync('src/lib/booksData.ts', 'utf-8');
booksDataCode = booksDataCode.replace(
  'image: string;\\n  coverImage?: string;',
  'image: string;\n  coverImage?: string;'
);
fs.writeFileSync('src/lib/booksData.ts', booksDataCode);
