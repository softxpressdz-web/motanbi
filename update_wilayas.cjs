const fs = require('fs');

const wilayasList = [
  "1- أدرار", "2- الشلف", "3- الأغواط", "4- أم البواقي", "5- باتنة", "6- بجاية", "7- بسكرة", "8- بشار", "9- البليدة", "10- البويرة",
  "11- تمنراست", "12- تبسة", "13- تلمسان", "14- تيارت", "15- تيزي وزو", "16- الجزائر", "17- الجلفة", "18- جيجل", "19- سطيف", "20- سعيدة",
  "21- سكيكدة", "22- سيدي بلعباس", "23- عنابة", "24- قالمة", "25- قسنطينة", "26- المدية", "27- مستغانم", "28- المسيلة", "29- معسكر", "30- ورقلة",
  "31- وهران", "32- البيض", "33- إليزي", "34- برج بوعريريج", "35- بومرداس", "36- الطارف", "37- تندوف", "38- تيسمسيلت", "39- الوادي", "40- خنشلة",
  "41- سوق أهراس", "42- تيبازة", "43- ميلة", "44- عين الدفلى", "45- النعامة", "46- عين تموشنت", "47- غرداية", "48- غليزان",
  "49- تيميمون", "50- برج باجي مختار", "51- أولاد جلال", "52- بني عباس", "53- عين صالح", "54- عين قزام", "55- تقرت", "56- جانت", "57- المغير", "58- المنيعة",
  "59- ولاية مقترحة (59)", "60- ولاية مقترحة (60)", "61- ولاية مقترحة (61)", "62- ولاية مقترحة (62)", "63- ولاية مقترحة (63)", "64- ولاية مقترحة (64)", 
  "65- ولاية مقترحة (65)", "66- ولاية مقترحة (66)", "67- ولاية مقترحة (67)", "68- ولاية مقترحة (68)", "69- ولاية مقترحة (69)"
];

const newWilayasObject = wilayasList.map(w => {
  const parts = w.split('-');
  let code = parts[0];
  let name = w;
  let shipping = 600;
  if(code === "16") shipping = 400; // Algiers
  if(code === "9") shipping = 300; // Blida
  if(code === "31") shipping = 600; // Oran
  if(parseInt(code) > 48) shipping = 900; // Far south
  return `{ code: "${code.padStart(2, '0')}", name: "${name}", shipping: ${shipping} }`;
});

const wilayasStr = `const ALGERIAN_WILAYAS = [\n  ${newWilayasObject.join(',\n  ')}\n];`;

let cartContent = fs.readFileSync('src/pages/Cart.tsx', 'utf8');
cartContent = cartContent.replace(/const ALGERIAN_WILAYAS = \[\s+[\s\S]*?\];/m, wilayasStr);
fs.writeFileSync('src/pages/Cart.tsx', cartContent);
console.log('Cart.tsx updated with 69 wilayas.');

