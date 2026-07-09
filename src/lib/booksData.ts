export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  description: string;
  pages: number;
  year: number;
  isbn: string;
  isBestseller?: boolean;
  isRecent?: boolean;
  isSchool?: boolean;
  schoolLevel?: "ابتدائي" | "متوسط" | "ثانوي" | "بكالوريا";
}

export const ALL_BOOKS: Book[] = [
  // FEATURED / BESTSELLERS
  {
    id: 1,
    title: "مقدمة ابن خلدون",
    author: "ابن خلدون",
    price: 2500,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    category: "كتب التاريخ",
    rating: 5,
    description: "مقدمة ابن خلدون هي كتاب ألفه ابن خلدون سنة 1377م كمقدمة لمؤلفه الضخم الموسوم كتاب العبر. وقد اعتبرت المقدمة لاحقاً مؤلفاً منفصلاً ذا طابع موسوعي إذ يتناول فيه جميع ميادين المعرفة من الشريعة والتاريخ والجغرافيا والاقتصاد والعمران والاجتماع والسياسة والطب. وقد تناول فيه أحوال البشر واختلافاتهم وطبائعهم والبيئة وأثرها في الإنسان.",
    pages: 650,
    year: 2023,
    isbn: "978-9931-12-111-2",
    isBestseller: true
  },
  {
    id: 2,
    title: "فن الحرب",
    author: "سون تزو",
    price: 1200,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    category: "كتب الفلسفة",
    rating: 4,
    description: "فن الحرب هو أطروحة عسكرية صينية قديمة تعزى إلى سون تزو، وهو ضابط عسكري واستراتيجي وتكتيكي صيني رفيع المستوى. يتكون الكتاب من 13 فصلاً، كل منها مخصص لمجموعة مختلفة من المهارات أو النصائح المتعلقة بالحرب والقتال التكتيكي والاستراتيجية العسكرية.",
    pages: 240,
    year: 2021,
    isbn: "978-9931-12-222-1",
    isBestseller: true
  },
  {
    id: 3,
    title: "الجريمة والعقاب",
    author: "فيودور دوستويفسكي",
    price: 1800,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    category: "كتب الادب",
    rating: 5,
    description: "رواية تدور حول الصراع النفسي والأخلاقي للشاب راديو راسكولنيكوف، طالب سابق فقير في سانت بطرسبرغ يخطط لقتل مرابية عجوز عديمة الرحمة لإنقاذ نفسه وعائلته من الفقر ولإثبات نظريته بأن الأقوياء يتجاوزون الحدود القانونية.",
    pages: 820,
    year: 2022,
    isbn: "978-9931-12-333-0",
    isBestseller: true
  },
  {
    id: 4,
    title: "الأجنحة المتكسرة",
    author: "جبران خليل جبران",
    price: 900,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
    category: "كتب الادب",
    rating: 4,
    description: "رواية شاعرية رومانسية اجتماعية تدور أحداثها في بيروت، وتتحدث عن الحب الأول المحكوم بالفشل والقيود والتقاليد الاجتماعية الطاغية التي تقف حائلاً أمام سعادة المحبين.",
    pages: 180,
    year: 2020,
    isbn: "978-9931-12-444-9",
    isBestseller: true
  },

  // RECENTLY PUBLISHED
  {
    id: 5,
    title: "فيزياء العقل",
    author: "روجر بنروز",
    price: 3200,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    category: "كتب رياضيات",
    rating: 5,
    description: "يبحث هذا الكتاب في طبيعة الوعي البشري وإمكانية تفسيره من خلال قوانين الفيزياء الحديثة وميكانيكا الكم، متسائلاً عما إذا كان الذكاء الاصطناعي قادراً على محاكاة الإدراك البشري الفعلي.",
    pages: 480,
    year: 2024,
    isbn: "978-9931-12-555-2",
    isRecent: true
  },
  {
    id: 6,
    title: "تاريخ العالم الإسلامي",
    author: "جمال الدين الشيال",
    price: 2100,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    category: "كتب التاريخ",
    rating: 4,
    description: "دراسة تاريخية شاملة تستعرض نشأة وتطور الدول الإسلامية المتعاقبة، والتحولات الكبرى في المجالات السياسية والاجتماعية والثقافية عبر العصور المختلفة.",
    pages: 520,
    year: 2023,
    isbn: "978-9931-12-666-5",
    isRecent: true
  },
  {
    id: 7,
    title: "عالم صوفي",
    author: "جوستاين غاردر",
    price: 1900,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    category: "كتب الفلسفة",
    rating: 5,
    description: "رواية عن تاريخ الفلسفة تبدأ برسائل غامضة تتلقاها طفلة تدعى صوفي أمندسن تسألها 'من أنت؟' و'من أين جاء العالم؟'، لتبدأ رحلة فلسفية فريدة ومثيرة عبر العصور.",
    pages: 550,
    year: 2023,
    isbn: "978-9931-12-777-8",
    isRecent: true
  },
  {
    id: 8,
    title: "مائة عام من العزلة",
    author: "غابرييل غارثيا ماركيث",
    price: 2800,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=800&auto=format&fit=crop",
    category: "كتب الادب",
    rating: 5,
    description: "من رصائع الواقعية السحرية وتدور أحداثها في بلدة ماكوندو الخيالية وتروي سيرة سبعة أجيال من عائلة بوينديا وتفاصيل حياتهم المليئة بالحب والجنون والعزلة الشديدة.",
    pages: 450,
    year: 2023,
    isbn: "978-9931-12-888-1",
    isRecent: true
  },
  {
    id: 13,
    title: "مقدمة ابن خلدون (إصدار فاخر)",
    author: "ابن خلدون",
    price: 3500,
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=800&auto=format&fit=crop",
    category: "كتب التاريخ",
    rating: 5,
    description: "إصدار فاخر ومنقح ومجلد تجليداً فنياً راقياً للمقدمة التاريخية الخالدة، مضافاً إليه تعليقات وهوامش توضيحية تسهل الفهم والمطالعة الأكاديمية.",
    pages: 720,
    year: 2024,
    isbn: "978-9931-12-999-4",
    isRecent: true
  },
  {
    id: 14,
    title: "سيكولوجية الجماهير",
    author: "غوستاف لوبون",
    price: 1800,
    image: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=800&auto=format&fit=crop",
    category: "علم النفس",
    rating: 4,
    description: "دراسة كلاسيكية هامة في علم النفس الاجتماعي تسلط الضوء على سلوك الجماهير وكيف تتحكم العواطف والغرائز الجمعية في تصرفات الأفراد عندما يندمجون في حشد جماهيري.",
    pages: 280,
    year: 2022,
    isbn: "978-9931-12-000-6",
    isRecent: true
  },
  {
    id: 15,
    title: "الخيميائي",
    author: "باولو كويلو",
    price: 2200,
    image: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=800&auto=format&fit=crop",
    category: "كتب الادب",
    rating: 5,
    description: "رواية تحفيزية شهيرة تتحدث عن راعي أندلسي يدعى سانتياغو يسافر في رحلة للبحث عن كنز مدفون في الأهرامات المصرية، ليتعلم خلال الرحلة كيف يصغي لقلبه ويفهم لغة العالم.",
    pages: 200,
    year: 2021,
    isbn: "978-9931-12-111-3",
    isRecent: true
  },
  {
    id: 16,
    title: "أصل الأنواع",
    author: "تشارلز داروين",
    price: 2900,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    category: "كتب الفلسفة",
    rating: 4,
    description: "أحد أهم المؤلفات العلمية في التاريخ الحديث والذي يطرح فيه نظرية التطور عبر الانتقاء الطبيعي والبقاء للأصلح، مستنداً إلى أبحاثه الميدانية وملاحظاته الطويلة.",
    pages: 580,
    year: 2020,
    isbn: "978-9931-12-222-4",
    isRecent: true
  },

  // SCHOOL BOOKS
  {
    id: 9,
    title: "الرياضيات للسنة الثالثة ثانوي",
    author: "وزارة التربية الوطنية",
    price: 1500,
    image: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?q=80&w=800&auto=format&fit=crop",
    category: "كتب مدرسية",
    rating: 4,
    description: "الكتاب المدرسي المعتمد رسمياً لتدريس مادة الرياضيات لطلاب السنة الثالثة من التعليم الثانوي شعبة علوم تجريبية، رياضيات، وتقني رياضي.",
    pages: 350,
    year: 2023,
    isbn: "978-9931-12-333-7",
    isSchool: true,
    schoolLevel: "ثانوي"
  },
  {
    id: 10,
    title: "العلوم الطبيعية للسنة الرابعة متوسط",
    author: "وزارة التربية الوطنية",
    price: 1200,
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=800&auto=format&fit=crop",
    category: "كتب مدرسية",
    rating: 5,
    description: "كتاب العلوم الطبيعية الموجه لطلاب شهادة التعليم المتوسط، ويحتوي على شروحات مفصلة وتجارب عملية في مجالات التغذية والاتصال العصبي والوراثة.",
    pages: 220,
    year: 2023,
    isbn: "978-9931-12-444-1",
    isSchool: true,
    schoolLevel: "متوسط"
  },
  {
    id: 11,
    title: "اللغة العربية للسنة الخامسة ابتدائي",
    author: "وزارة التربية الوطنية",
    price: 800,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=800&auto=format&fit=crop",
    category: "كتب مدرسية",
    rating: 4,
    description: "كتاب اللغة العربية للسنة الخامسة من التعليم الابتدائي، يهدف إلى تحسين جودة القراءة والنحو والإملاء والتعبير الكتابي لدى الطفل بلغة سليمة وممتعة.",
    pages: 180,
    year: 2022,
    isbn: "978-9931-12-555-5",
    isSchool: true,
    schoolLevel: "ابتدائي"
  },
  {
    id: 12,
    title: "حوليات البكالوريا - فيزياء",
    author: "مجموعة أساتذة متميزين",
    price: 2000,
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=800&auto=format&fit=crop",
    category: "كتب مدرسية",
    rating: 5,
    description: "مجموعة من مواضيع البكالوريا الرسمية السابقة مع حلولها المفصلة والشافية، بالإضافة إلى تمارين تدريبية مصممة خصيصاً لمساعدة الطلاب على التفوق.",
    pages: 290,
    year: 2024,
    isbn: "978-9931-12-666-8",
    isSchool: true,
    schoolLevel: "بكالوريا"
  },

  // EXTRA BOOKS TO MATCH OTHER NEW CATEGORIES
  {
    id: 17,
    title: "مبادئ الاقتصاد والعلوم المالية",
    author: "أ.د. سمير البرغوثي",
    price: 2600,
    image: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?q=80&w=800&auto=format&fit=crop",
    category: "كتب الاقتصاد",
    rating: 4,
    description: "مرجع شامل يعالج أساسيات علم الاقتصاد الكلي والجزئي ومبادئ المعاملات والسياسات المالية بأسلوب أكاديمي مبسط يناسب طلاب الجامعات والباحثين.",
    pages: 410,
    year: 2023,
    isbn: "978-9931-12-777-1",
  },
  {
    id: 18,
    title: "التسويق الرقمي وتطبيقاته الحديثة",
    author: "د. رامي ياسين",
    price: 2300,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
    category: "كتب التسويق",
    rating: 5,
    description: "كتاب عملي يستعرض استراتيجيات التسويق الرقمي الحديث، الإعلانات الممولة عبر شبكات التواصل الاجتماعي، وتحسين محركات البحث لتحقيق ريادة الأعمال.",
    pages: 320,
    year: 2024,
    isbn: "978-9931-12-888-4",
  },
  {
    id: 19,
    title: "أصول الشريعة الإسلامية",
    author: "الشيخ عبد الحليم محمود",
    price: 1500,
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
    category: "كتب الشريعة",
    rating: 5,
    description: "مؤلف رصين يتناول أصول التشريع الإسلامي ومقاصد الشريعة والاجتهاد وتطبيق الأحكام الفقهية على النوازل العصرية برؤية مستنيرة ومتوازنة.",
    pages: 340,
    year: 2022,
    isbn: "978-9931-12-999-7",
  },
  {
    id: 20,
    title: "المدخل إلى دراسة القانون والتشريعات",
    author: "د. عبد الرزاق السنهوري",
    price: 3000,
    image: "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop",
    category: "كتب القانون",
    rating: 5,
    description: "المرجع الجامعي الرائد لدراسة القانون ونظريتي الحق والالتزام وتفاصيل صياغة الدساتير والتشريعات المدنية المقارنة في العالم العربي.",
    pages: 580,
    year: 2023,
    isbn: "978-9931-12-000-0",
  }
];

export const CATEGORIES = [
  "الكل", "كتب الاقتصاد", "كتب التسويق", "كتب المحاسبة", 
  "كتب التسيير", "كتب التجارة", "كتب اللغة", "كتب الفلسفة", 
  "كتب الادب", "كتب الشريعة", "كتب دينية", "علم النفس", 
  "كتب التاريخ", "كتب الطب", "كتب القانون", "كتب الرياضة", 
  "كتب رياضيات", "كتب إحصاء", "كتب مدرسية"
];
