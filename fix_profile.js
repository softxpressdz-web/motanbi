import fs from 'fs';
let code = fs.readFileSync('src/pages/Profile.tsx', 'utf-8');

// I need to find where I injected the modal (at the bottom) and remove it, then inject it at the end of the Profile component.
// The modal starts with {/* Signing Modal */} and ends before // Inner helper component

const modalContentMatch = code.match(/\{\/\* Signing Modal \*\/\}[\s\S]*?(?=\/\/ Inner helper component to load items asynchronously)/);

if (modalContentMatch) {
  let modalContent = modalContentMatch[0];
  
  // Remove the erroneously inserted modal from the bottom
  code = code.replace(modalContent, "");
  
  // Inject it right before the end of the Profile component
  // The Profile component ends just before // Inner helper component
  
  code = code.replace(
    /(\s*<\/div>\s*<\/div>\s*\);\s*\})(\s*\/\/ Inner helper component)/,
    "\\n" + modalContent + "$1$2"
  );
  
  // Also fix the dangling syntax error if there is one. Wait, in my previous replace, I replaced `</div></div>);}` with the modal and then didn't close the `OrderDetailsLoader` component properly if I overwrote its closing tags.
  
  // Let me just restore the file completely from scratch. No, it's safer to just fix the syntax.
}

fs.writeFileSync('src/pages/Profile.tsx', code);
