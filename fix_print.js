import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  '      html2pdf().from(element).set(opt).save().then(() => {\\n        element.classList.add(\\\'hidden\\\');\\n        element.classList.add(\\\'print:block\\\');\\n      });',
  '      html2pdf().from(element).set(opt).save();'
);

code = code.replace(
  'element.classList.remove(\\\'hidden\\\');\\n      element.classList.remove(\\\'print:block\\\');',
  ''
);

fs.writeFileSync('src/pages/Profile.tsx', code);
