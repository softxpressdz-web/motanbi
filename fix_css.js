import fs from 'fs';
let css = fs.readFileSync('src/index.css', 'utf-8');

const regex = /@media print \{\n  body \* \{\n    visibility: hidden;\n  \}[\s\S]*\}\n\n/m;
css = css.replace(regex, '');

// Also search for any remaining #contract-print-area rules
css = css.replace(/@media print \{[\s\S]*#contract-print-area[\s\S]*\}/m, '');

fs.writeFileSync('src/index.css', css);
