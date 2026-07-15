import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

code = code.replace(
  'import {\\n  Printer, X, User as FirebaseUser } from "firebase/auth";',
  'import { User as FirebaseUser } from "firebase/auth";'
);

code = code.replace(
  'import {\\n  User, Mail',
  'import {\\n  Printer, X, User, Mail'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
