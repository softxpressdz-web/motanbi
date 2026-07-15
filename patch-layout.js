import fs from 'fs';
let code = fs.readFileSync('src/components/Layout.tsx', 'utf-8');

const newLink = '<li><Link to="/publish-book" className="hover:text-accent-gold transition-colors">أنشر معنا</Link></li>\n              <li><Link to="/publishing-policy" className="hover:text-accent-gold transition-colors">سياسة النشر</Link></li>';

code = code.replace(
  '<li><Link to="/publish-book" className="hover:text-accent-gold transition-colors">أنشر معنا</Link></li>',
  newLink
);

fs.writeFileSync('src/components/Layout.tsx', code);
