import fs from 'fs';
let code = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

code = code.replace(
  '<Link to="/about-publishing" className="hover:text-accent-gold transition-colors">سياسة النشر</Link>',
  '<Link to="/publishing-policy" className="hover:text-accent-gold transition-colors">سياسة النشر</Link>'
);

code = code.replace(
  '<li><Link to="/publishing-policy" className="hover:text-accent-gold transition-colors">سياسة النشر</Link></li>\n',
  ''
);

fs.writeFileSync('src/components/Layout.tsx', code);
