import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

code = code.replace(
  '                  )}\\n            </div>\\n          </div>\\n        )}',
  '                  )}\n                </div>\n              </div>\n            </div>\n          </div>\n        )}'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
