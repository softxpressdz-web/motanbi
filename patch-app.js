import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import { PublishingPolicy }")) {
  code = code.replace(
    'import { Profile } from "./pages/Profile";',
    'import { Profile } from "./pages/Profile";\nimport { PublishingPolicy } from "./pages/PublishingPolicy";'
  );
  code = code.replace(
    '<Route path="/publish-book" element={<PublishBook />} />',
    '<Route path="/publish-book" element={<PublishBook />} />\n          <Route path="/publishing-policy" element={<PublishingPolicy />} />'
  );
  fs.writeFileSync('src/App.tsx', code);
}
