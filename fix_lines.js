import fs from 'fs';
let lines = fs.readFileSync('src/pages/Profile.tsx', 'utf-8').split('\n');

lines[1] = 'import { User as FirebaseUser } from "firebase/auth";';
lines[2] = '';
lines[5] = '  Printer, X, User, Mail, Phone, MapPin, Save, Loader2, CheckCircle2,';

fs.writeFileSync('src/pages/Profile.tsx', lines.join('\n'));
