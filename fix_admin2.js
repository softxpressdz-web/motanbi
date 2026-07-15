import fs from 'fs';
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf-8');

// The original file had:
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

// But now it has:
//                   )}
//             </div>
//           </div>
//         )}
// We need to add two more </div> tags.

code = code.replace(
  '                  )}\n            </div>\n          </div>\n        )}',
  '                  )}\n                </div>\n              </div>\n            </div>\n          </div>\n        )}'
);

fs.writeFileSync('src/pages/Admin.tsx', code);
