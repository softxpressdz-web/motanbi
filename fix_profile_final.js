import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// The modal code is currently just floating at the bottom without closing Profile.
// Let's insert the missing Profile closing tags.

code = code.replace(
  '      // Inner helper component to load items asynchronously',
  '      </div>\n    </div>\n  );\n}\n\n// Inner helper component to load items asynchronously'
);

fs.writeFileSync('src/pages/Profile.tsx', code);
