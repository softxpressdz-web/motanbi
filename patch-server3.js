import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf-8');
code = code.replace(/const \{ status, retailPrice \} = req\.body;/g, "const { status, retailPrice, productionCostPerBook } = req.body;");
fs.writeFileSync('server.ts', code);
