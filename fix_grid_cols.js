import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  'className="bg-stone-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center"',
  'className="bg-stone-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-center"'
);
code = code.replace(
  'className="grid grid-cols-2 md:grid-cols-4 gap-4"',
  'className="grid grid-cols-2 md:grid-cols-5 gap-4"'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
