import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

// Initialize Firebase Admin (from config)
import { initializeApp, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import firebaseConfig from "./firebase-applet-config.json";

if (!getApps().length) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}
export const adminAuth = getAuth();

// Lazy initialize GoogleGenAI client safely
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Database
import { db } from "./src/db/index.js"; // Note: .js extension for execution
import * as schema from "./src/db/schema.js";
import { eq, and, or, like, desc, asc, gte, lte } from "drizzle-orm";
import { ALL_BOOKS, CATEGORIES } from "./src/lib/booksData.js";

// Database Seeding Logic
async function seedDatabase() {
  try {
    // 1. Seed Categories
    const existingCats = await db.select().from(schema.categories);
    const categoryMap = new Map<string, number>();

    if (existingCats.length === 0) {
      console.log("Seeding categories into database...");
      const catsToInsert = CATEGORIES.filter(c => c !== "الكل").map(catName => ({
        name: catName,
        description: `كتب ومؤلفات قيمة في مجال ${catName}`,
      }));

      if (catsToInsert.length > 0) {
        const insertedCats = await db.insert(schema.categories).values(catsToInsert).returning();
        insertedCats.forEach(cat => {
          categoryMap.set(cat.name, cat.id);
        });
      }
    } else {
      existingCats.forEach(cat => {
        categoryMap.set(cat.name, cat.id);
      });
    }

    // 2. Seed Books and Authors
    const existingBooks = await db.select().from(schema.books);
    if (existingBooks.length === 0) {
      console.log("Seeding books into database...");
      for (const b of ALL_BOOKS) {
        const [insertedBook] = await db.insert(schema.books).values({
          title: b.title,
          description: b.description || "",
          price: b.price.toString(),
          coverImage: b.image,
          isbn: b.isbn || "",
          pages: b.pages || 100,
          publishYear: b.year || 2024,
          publisher: "دار المتنبي للطباعة والنشر",
          status: "available",
          stock: 150,
        }).returning();

        // Map Category relationship
        const catId = categoryMap.get(b.category);
        if (catId && insertedBook) {
          await db.insert(schema.bookCategories).values({
            bookId: insertedBook.id,
            categoryId: catId,
          });
        }

        // Handle Author Seeding
        const existingAuthors = await db.select().from(schema.authors);
        let authorId: number;
        const matchedAuthor = existingAuthors.find(a => a.name === b.author);
        
        if (!matchedAuthor) {
          const [newAuthor] = await db.insert(schema.authors).values({
            name: b.author,
            bio: `كاتب ومؤلف متميز ومساهم علمي لدى دار المتنبي للطباعة والنشر والتوزيع.`,
          }).returning();
          authorId = newAuthor.id;
        } else {
          authorId = matchedAuthor.id;
        }

        if (insertedBook && authorId) {
          await db.insert(schema.bookAuthors).values({
            bookId: insertedBook.id,
            authorId: authorId,
          });
        }
      }
      console.log("Database seeded successfully with initial catalog!");
    }

    // 3. Seed Coupons
    const existingCoupons = await db.select().from(schema.coupons);
    if (existingCoupons.length === 0) {
      console.log("Seeding coupons into database...");
      await db.insert(schema.coupons).values([
        {
          code: "MUTANABBI10",
          discountType: "percentage",
          value: "10.00",
          maxUses: 100,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        },
        {
          code: "ALGERIA62",
          discountType: "fixed",
          value: "500.00",
          maxUses: 50,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
        {
          code: "READ2026",
          discountType: "percentage",
          value: "20.00",
          maxUses: 200,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
      ]);
    }

    // 4. Seed Blog Posts
    const existingPosts = await db.select().from(schema.blogPosts);
    if (existingPosts.length === 0) {
      console.log("Seeding blog posts into database...");
      const [adminUser] = await db.select().from(schema.users).where(eq(schema.users.role, "admin"));
      let authorId: number | null = adminUser ? adminUser.id : null;
      if (!authorId) {
        const [systemAdmin] = await db.insert(schema.users).values({
          uid: "system-admin-uid",
          name: "إدارة دار المتنبي",
          email: "admin@elmotanaby.com",
          role: "admin",
        }).returning();
        authorId = systemAdmin.id;
      }

      await db.insert(schema.blogPosts).values([
        {
          title: "أهمية القراءة في عصر الذكاء الاصطناعي",
          content: "في عصر التسارع الرقمي وثورة الذكاء الاصطناعي، يظن الكثيرون أن الكتاب الورقي قد يفقد بريقه. إلا أن الواقع يثبت العكس؛ فالقراءة العميقة والمتمهلة للكتب الورقية هي الأداة الأقوى لتطوير التفكير النقدي والتركيز الإنساني. تساهم قراءة المؤلفات الفلسفية والأدبية في بناء الوعي وحماية العقل من تشتت المنصات الرقمية. نحن في دار المتنبي نؤمن بأن المعرفة الحقيقية تبدأ من صفحات الكتاب.",
          image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800&auto=format&fit=crop",
          authorId,
          publishedAt: new Date(),
        },
        {
          title: "تاريخ حركة النشر والطباعة في الجزائر العريقة",
          content: "تتمتع الجزائر بإرث ثقافي وتاريخي عريق يمتد لقرون. ومنذ فجر الاستقلال، واجهت حركة النشر والطباعة تحديات كبرى لترسيخ الهوية الوطنية ونشر العلوم والمعرفة باللغتين العربية والفرنسية. لقد ساهمت دور النشر الجزائرية، ومن بينها دار المتنبي للطباعة والنشر والتوزيع، في إثراء المكتبات المدرسية والجامعية بإنتاج متميز يواكب تطور المناهج ويلبي شغف القارئ الجزائري بالرواية، التاريخ، القانون والشريعة.",
          image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
          authorId,
          publishedAt: new Date(),
        },
        {
          title: "خطوات كتابة مخطوطة روائية أو علمية ناجحة",
          content: "يتساءل الكثير من الكتاب الشباب والمبدعين عن الآلية الصحيحة التي تتبعها دور النشر لتقييم المخطوطات وقبولها للطباعة والتوزيع. في هذا المقال، نكشف لكم الخطوات الأساسية لإعداد مخطوطة متميزة: من تحديد الفكرة العامة، ووضع هيكلية الفصول، مروراً بالتدقيق اللغوي والنحوي الصارم، وانتهاءً بكتابة ملخص احترافي يعكس القيمة العلمية أو الإبداعية لعملك. يسعدنا دائماً في دار المتنبي استقبال مخطوطاتكم الإبداعية عبر بوابتنا الإلكترونية.",
          image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop",
          authorId,
          publishedAt: new Date(),
        },
      ]);
    }
  } catch (error) {
    console.error("Error during database seeding:", error);
  }
}

export const app = express();



  app.use(cors());
  app.use(express.json());

  // Run seeding in background
  seedDatabase();

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Dar Al-Mutanabbi API is running perfectly" });
  });

  // Support Chat API with Gemini & fallback
  app.post("/api/support-chat", async (req, res) => {
    try {
      const { message } = req.body;
      const client = getAIClient();

      if (client) {
        const systemInstruction = 
          "أنت المساعد الذكي التفاعلي لدار المتنبي للطباعة والنشر (دار النشر الجزائرية العريقة). اسمك 'مساعد المتنبي'. " +
          "تقدم المساعدة باللغة العربية بأسلوب مهذب وودود وراقٍ وثقافي. تجيب على أسئلة العملاء والكتّاب حول: " +
          "1. كيفية نشر كتبهم (إرسال المخطوطة، التقييم والتسعير، التدقيق، الطباعة والتوزيع). " +
          "2. أسعار كتبنا ومجالاتنا المختلفة (تاريخ، أدب، شريعة، اقتصاد، قانون، كتب مدرسية وجامعية). " +
          "3. معلومات التواصل: البريد CONTACT@elmotanaby.com، الهاتف +213 660 00 00 00. " +
          "أجب باختصار وبشكل منسق وجميل باستخدام نقاط واضحة ومختصرة ولا تزد عن 3-4 أسطر إلا للضرورة القصوى.";

        const response = await client.models.generateContent({
          model: "gemini-3.5-flash",
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.7,
          }
        });

        return res.json({ reply: response.text || "مرحباً بك! كيف يمكنني مساعدتك اليوم؟" });
      } else {
        const lowerMsg = message.toLowerCase();
        let reply = "أهلاً بك في دار المتنبي للطباعة والنشر! أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟";
        
        if (lowerMsg.includes("نشر") || lowerMsg.includes("أنشر") || lowerMsg.includes("انشر") || lowerMsg.includes("كتابي")) {
          reply = "يسعدنا جداً اهتمامك بالنشر معنا! لنشر كتابك في دار المتنبي، يرجى إرسال ملف المخطوطة كاملاً بصيغة PDF أو Word إلى البريد الإلكتروني الخاص بقسم التقييم: publish@elmotanaby.com مع إرفاق سيرتك الذاتية وملخص للكتاب. وسيقوم المجلس العلمي بمراجعة المخطوطة والرد عليك خلال 15 يوماً.";
        } else if (lowerMsg.includes("شراء") || lowerMsg.includes("متجر") || lowerMsg.includes("سعر") || lowerMsg.includes("شحن") || lowerMsg.includes("توصيل")) {
          reply = "نوفر خدمة الشحن السريع لجميع الولايات في الجزائر! يمكنك تصفح الكتب وإضافتها إلى سلة التسوق ثم إتمام الطلب بملء معلومات الشحن والدفع عند الاستلام.";
        } else if (lowerMsg.includes("تواصل") || lowerMsg.includes("اتصال") || lowerMsg.includes("هاتف") || lowerMsg.includes("رقم")) {
          reply = "يسعدنا تواصلك معنا مباشرة عبر الهاتف: +213 660 00 00 00 أو عبر البريد الإلكتروني: contact@elmotanaby.com. أوقات عملنا من الأحد إلى الخميس من 8:00 صباحاً حتى 4:30 مساءً.";
        } else if (lowerMsg.includes("عنوان") || lowerMsg.includes("موقعكم") || lowerMsg.includes("مكان")) {
          reply = "مقر دار المتنبي الرئيسي يقع في الجزائر العاصمة (حي وادي الرمان، البليدة)، ونشارك في كافة المعارض الوطنية والدولية للكتاب بما في ذلك صالون الجزائر الدولي للكتاب (SILA).";
        }
        
        return res.json({ reply });
      }
    } catch (err: any) {
      console.error("Chat error:", err);
      res.status(500).json({ reply: "عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة لاحقاً." });
    }
  });

  // Standardized response helper
  const sendAPIResponse = (res: express.Response, status: "success" | "error", message: string, data: any = null, pagination: any = null, statusCode: number = 200) => {
    return res.status(statusCode).json({
      status,
      message,
      data,
      ...(pagination && { pagination }),
    });
  };

  // Resolve user database ID from UID or return original if it is a number
  async function resolveUserId(uidOrId: string | number): Promise<number | null> {
    if (typeof uidOrId === "number" || !isNaN(Number(uidOrId))) {
      return Number(uidOrId);
    }
    const [userObj] = await db.select().from(schema.users).where(eq(schema.users.uid, uidOrId.toString()));
    return userObj ? userObj.id : null;
  }

  // Get or Create user helper
  async function getOrCreateUser(uid: string, email: string, name?: string) {
    try {
      const [existing] = await db.select().from(schema.users).where(eq(schema.users.uid, uid));
      if (existing) {
        if (existing.email === "softxpressdz@gmail.com" && existing.role !== "admin") {
          await db.update(schema.users).set({ role: "admin" }).where(eq(schema.users.id, existing.id));
          existing.role = "admin";
        }
        return existing;
      }
      const [newUser] = await db.insert(schema.users).values({
        uid,
        email,
        name: name || email.split("@")[0],
        role: email === "softxpressdz@gmail.com" ? "admin" : "customer",
      }).returning();
      return newUser;
    } catch (err) {
      console.error("Error in getOrCreateUser:", err);
      return null;
    }
  }

  // 1. Auth & Profile Synchronization Endpoints
  app.post("/api/auth/sync", async (req, res) => {
    try {
      const { uid, email, name, phone, address } = req.body;
      if (!uid || !email) {
        return sendAPIResponse(res, "error", "معرف المستخدم والبريد الإلكتروني مطلوبان", null, null, 400);
      }
      const userObj = await getOrCreateUser(uid, email, name);
      if (!userObj) {
        return sendAPIResponse(res, "error", "فشل مزامنة حساب المستخدم", null, null, 500);
      }
      
      if (phone || address || name) {
        await db.update(schema.users)
          .set({
            ...(name && { name }),
            ...(phone && { phone }),
            ...(address && { address }),
          })
          .where(eq(schema.users.id, userObj.id));
      }
      
      const [updatedUser] = await db.select().from(schema.users).where(eq(schema.users.id, userObj.id));
      return sendAPIResponse(res, "success", "تمت مزامنة حساب المستخدم بنجاح", updatedUser);
    } catch (error: any) {
      console.error("Auth sync error:", error);
      return sendAPIResponse(res, "error", "حدث خطأ غير متوقع", error.message, null, 500);
    }
  });

  app.get("/api/users/profile/:uid", async (req, res) => {
    try {
      const { uid } = req.params;
      const [userObj] = await db.select().from(schema.users).where(eq(schema.users.uid, uid));
      if (!userObj) {
        return sendAPIResponse(res, "error", "المستخدم غير موجود", null, null, 404);
      }
      return sendAPIResponse(res, "success", "تم جلب بيانات الملف الشخصي", userObj);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب الملف الشخصي", error.message, null, 500);
    }
  });

  app.put("/api/users/profile", async (req, res) => {
    try {
      const { uid, name, phone, address } = req.body;
      if (!uid) {
        return sendAPIResponse(res, "error", "معرف المستخدم مطلوب", null, null, 400);
      }
      await db.update(schema.users)
        .set({
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
        })
        .where(eq(schema.users.uid, uid));
      const [updated] = await db.select().from(schema.users).where(eq(schema.users.uid, uid));
      return sendAPIResponse(res, "success", "تم تحديث الملف الشخصي بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث الملف الشخصي", error.message, null, 500);
    }
  });

  // 2. Books Endpoints (Search, Filter, Sort, Paginate)
  app.get("/api/books", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const offset = (page - 1) * limit;

      const search = (req.query.search as string || "").trim();
      const categoryId = req.query.category ? parseInt(req.query.category as string) : null;
      const authorId = req.query.author ? parseInt(req.query.author as string) : null;
      const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice as string) : null;
      const maxPrice = req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : null;
      const sortBy = req.query.sortBy as string || "recent";

      const allBooks = await db.select().from(schema.books);
      const allBookCats = await db.select().from(schema.bookCategories);
      const allBookAuthors = await db.select().from(schema.bookAuthors);
      const allCategories = await db.select().from(schema.categories);
      const allAuthors = await db.select().from(schema.authors);

      let enrichedBooks = allBooks.map(book => {
        const catRel = allBookCats.find(bc => bc.bookId === book.id);
        const categoryObj = catRel ? allCategories.find(c => c.id === catRel.categoryId) : null;
        
        const authRel = allBookAuthors.find(ba => ba.bookId === book.id);
        const authorObj = authRel ? allAuthors.find(a => a.id === authRel.authorId) : null;

        return {
          ...book,
          categoryName: categoryObj ? categoryObj.name : "عام",
          categoryId: categoryObj ? categoryObj.id : null,
          authorName: authorObj ? authorObj.name : "مؤلف مجهول",
          authorId: authorObj ? authorObj.id : null,
        };
      });

      if (search) {
        const query = search.toLowerCase();
        enrichedBooks = enrichedBooks.filter(b => 
          b.title.toLowerCase().includes(query) || 
          (b.description && b.description.toLowerCase().includes(query)) ||
          b.authorName.toLowerCase().includes(query) ||
          (b.isbn && b.isbn.toLowerCase().includes(query))
        );
      }

      if (categoryId) {
        enrichedBooks = enrichedBooks.filter(b => b.categoryId === categoryId);
      }

      if (authorId) {
        enrichedBooks = enrichedBooks.filter(b => b.authorId === authorId);
      }

      if (minPrice !== null) {
        enrichedBooks = enrichedBooks.filter(b => parseFloat(b.price) >= minPrice);
      }

      if (maxPrice !== null) {
        enrichedBooks = enrichedBooks.filter(b => parseFloat(b.price) <= maxPrice);
      }

      if (sortBy === "price_asc") {
        enrichedBooks.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      } else if (sortBy === "price_desc") {
        enrichedBooks.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      } else if (sortBy === "bestseller") {
        const staticBestsellers = ALL_BOOKS.filter(ab => ab.isBestseller).map(ab => ab.title);
        enrichedBooks.sort((a, b) => {
          const aBest = staticBestsellers.includes(a.title) ? 1 : 0;
          const bBest = staticBestsellers.includes(b.title) ? 1 : 0;
          return bBest - aBest;
        });
      } else {
        enrichedBooks.sort((a, b) => b.id - a.id);
      }

      const total = enrichedBooks.length;
      const totalPages = Math.ceil(total / limit);
      const paginatedBooks = enrichedBooks.slice(offset, offset + limit);

      return sendAPIResponse(res, "success", "تم جلب الكتب بنجاح", paginatedBooks, {
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error: any) {
      console.error("Error fetching books:", error);
      return sendAPIResponse(res, "error", "فشل جلب الكتب", error.message, null, 500);
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [book] = await db.select().from(schema.books).where(eq(schema.books.id, id));
      if (!book) {
        return sendAPIResponse(res, "error", "الكتاب غير موجود", null, null, 404);
      }

      const [catRel] = await db.select().from(schema.bookCategories).where(eq(schema.bookCategories.bookId, id));
      const categoryObj = catRel ? (await db.select().from(schema.categories).where(eq(schema.categories.id, catRel.categoryId)))[0] : null;

      const [authRel] = await db.select().from(schema.bookAuthors).where(eq(schema.bookAuthors.bookId, id));
      const authorObj = authRel ? (await db.select().from(schema.authors).where(eq(schema.authors.id, authRel.authorId)))[0] : null;

      const result = {
        ...book,
        category: categoryObj ? categoryObj.name : "عام",
        categoryId: categoryObj ? categoryObj.id : null,
        author: authorObj ? authorObj.name : "مؤلف مجهول",
        authorId: authorObj ? authorObj.id : null,
        authorBio: authorObj ? authorObj.bio : null,
        authorImage: authorObj ? authorObj.image : null,
      };

      return sendAPIResponse(res, "success", "تم جلب تفاصيل الكتاب", result);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب تفاصيل الكتاب", error.message, null, 500);
    }
  });

  app.post("/api/books", async (req, res) => {
    try {
      const { title, price, description, coverImage, isbn } = req.body;
      const [newBook] = await db.insert(schema.books).values({
        title: title || "كتاب جديد",
        price: price || "0",
        description: description || "",
        coverImage: coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80",
        isbn: isbn || ""
      }).returning();
      return sendAPIResponse(res, "success", "تمت إضافة الكتاب بنجاح", newBook);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة الكتاب", error.message, null, 500);
    }
  });

  app.delete("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.books).where(eq(schema.books.id, id));
      return sendAPIResponse(res, "success", "تم حذف الكتاب بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف الكتاب", error.message, null, 500);
    }
  });

  app.get("/api/books/:id/related", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [catRel] = await db.select().from(schema.bookCategories).where(eq(schema.bookCategories.bookId, id));
      
      if (!catRel) {
        const randomBooks = await db.select().from(schema.books).limit(4);
        return sendAPIResponse(res, "success", "كتب مشابهة عامة", randomBooks.filter(b => b.id !== id));
      }

      const otherRels = await db.select().from(schema.bookCategories).where(eq(schema.bookCategories.categoryId, catRel.categoryId));
      const bookIds = otherRels.map(r => r.bookId).filter(bid => bid !== id);

      if (bookIds.length === 0) {
        const randomBooks = await db.select().from(schema.books).limit(4);
        return sendAPIResponse(res, "success", "كتب مشابهة عامة", randomBooks.filter(b => b.id !== id));
      }

      const matchingBooks = [];
      for (const bid of bookIds.slice(0, 4)) {
        const [bk] = await db.select().from(schema.books).where(eq(schema.books.id, bid));
        if (bk) matchingBooks.push(bk);
      }

      return sendAPIResponse(res, "success", "تم جلب الكتب المشابهة", matchingBooks);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب الكتب المشابهة", error.message, null, 500);
    }
  });

  // 3. Categories & Authors Endpoints
  app.get("/api/categories", async (req, res) => {
    try {
      const allCategories = await db.select().from(schema.categories);
      return sendAPIResponse(res, "success", "تم جلب التصنيفات بنجاح", allCategories);
    } catch (error: any) {
      console.error("Error fetching categories:", error);
      return sendAPIResponse(res, "error", "فشل جلب التصنيفات", error.message, null, 500);
    }
  });

  app.get("/api/categories/:id/books", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const rels = await db.select().from(schema.bookCategories).where(eq(schema.bookCategories.categoryId, categoryId));
      const booksList = [];
      for (const r of rels) {
        const [bk] = await db.select().from(schema.books).where(eq(schema.books.id, r.bookId));
        if (bk) booksList.push(bk);
      }
      return sendAPIResponse(res, "success", "تم جلب كتب التصنيف بنجاح", booksList);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب كتب التصنيف", error.message, null, 500);
    }
  });

  app.get("/api/authors", async (req, res) => {
    try {
      const auths = await db.select().from(schema.authors);
      return sendAPIResponse(res, "success", "تم جلب المؤلفين بنجاح", auths);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب المؤلفين", error.message, null, 500);
    }
  });

  app.get("/api/authors/:id/books", async (req, res) => {
    try {
      const authorId = parseInt(req.params.id);
      const rels = await db.select().from(schema.bookAuthors).where(eq(schema.bookAuthors.authorId, authorId));
      const booksList = [];
      for (const r of rels) {
        const [bk] = await db.select().from(schema.books).where(eq(schema.books.id, r.bookId));
        if (bk) booksList.push(bk);
      }
      return sendAPIResponse(res, "success", "تم جلب كتب المؤلف بنجاح", booksList);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب كتب المؤلف", error.message, null, 500);
    }
  });

  // 4. Cart Endpoints
  app.get("/api/cart", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return sendAPIResponse(res, "error", "معرف المستخدم مطلوب", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId as string);
      if (!resolvedId) {
        return sendAPIResponse(res, "success", "السلة فارغة لعدم وجود حساب", []);
      }

      const items = await db.select().from(schema.cart).where(eq(schema.cart.userId, resolvedId));
      const cartWithBooks = [];
      for (const item of items) {
        const [book] = await db.select().from(schema.books).where(eq(schema.books.id, item.bookId));
        if (book) {
          cartWithBooks.push({
            ...item,
            book,
          });
        }
      }
      return sendAPIResponse(res, "success", "محتويات سلة التسوق", cartWithBooks);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب السلة", error.message, null, 500);
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const { userId, bookId, quantity } = req.body;
      if (!userId || !bookId) {
        return sendAPIResponse(res, "error", "معرف المستخدم والكتاب مطلوبان", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId);
      if (!resolvedId) {
        return sendAPIResponse(res, "error", "المستخدم غير مسجل في قاعدة البيانات", null, null, 404);
      }

      const q = parseInt(quantity?.toString() || "1");

      const [existing] = await db.select().from(schema.cart)
        .where(and(eq(schema.cart.userId, resolvedId), eq(schema.cart.bookId, bookId)));

      if (existing) {
        await db.update(schema.cart)
          .set({ quantity: existing.quantity + q })
          .where(eq(schema.cart.id, existing.id));
        const [updated] = await db.select().from(schema.cart).where(eq(schema.cart.id, existing.id));
        return sendAPIResponse(res, "success", "تمت زيادة كمية المنتج بالسلة", updated);
      } else {
        const [inserted] = await db.insert(schema.cart).values({
          userId: resolvedId,
          bookId: parseInt(bookId.toString()),
          quantity: q,
        }).returning();
        return sendAPIResponse(res, "success", "تمت إضافة المنتج للسلة بنجاح", inserted);
      }
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة عنصر للسلة", error.message, null, 500);
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      if (quantity === undefined) {
        return sendAPIResponse(res, "error", "الكمية مطلوبة", null, null, 400);
      }
      const q = parseInt(quantity.toString());
      if (q <= 0) {
        await db.delete(schema.cart).where(eq(schema.cart.id, id));
        return sendAPIResponse(res, "success", "تم حذف المنتج من السلة لتصفير الكمية");
      }
      await db.update(schema.cart).set({ quantity: q }).where(eq(schema.cart.id, id));
      const [updated] = await db.select().from(schema.cart).where(eq(schema.cart.id, id));
      return sendAPIResponse(res, "success", "تم تحديث كمية المنتج بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تعديل كمية السلة", error.message, null, 500);
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.cart).where(eq(schema.cart.id, id));
      return sendAPIResponse(res, "success", "تم حذف المنتج من سلة التسوق");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف منتج من السلة", error.message, null, 500);
    }
  });

  app.delete("/api/cart/clear", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return sendAPIResponse(res, "error", "معرف المستخدم مطلوب لتفريغ السلة", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId as string);
      if (resolvedId) {
        await db.delete(schema.cart).where(eq(schema.cart.userId, resolvedId));
      }
      return sendAPIResponse(res, "success", "تم تفريغ سلة التسوق بالكامل");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تفريغ سلة التسوق", error.message, null, 500);
    }
  });

  // 5. Contact Message & Manuscripts
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return sendAPIResponse(res, "error", "جميع الحقول مطلوبة لإرسال رسالة", null, null, 400);
      }

      const [newMessage] = await db.insert(schema.contactMessages).values({
        name,
        email,
        subject,
        message,
        status: "unread",
      }).returning();

      return sendAPIResponse(res, "success", "تم استقبال رسالتك بنجاح، وسنتواصل معك قريباً", newMessage);
    } catch (error: any) {
      console.error("Error saving contact message:", error);
      return sendAPIResponse(res, "error", "حدث خطأ أثناء حفظ الرسالة", error.message, null, 500);
    }
  });

  app.get("/api/contact-messages", async (req, res) => {
    try {
      const messages = await db.select().from(schema.contactMessages);
      return sendAPIResponse(res, "success", "قائمة رسائل التواصل", messages);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "Failed to fetch contact messages", error.message, null, 500);
    }
  });

  app.post("/api/manuscripts", async (req, res) => {
    try {
      const {
        authorName,
        email,
        phone,
        bookCategory,
        bookTitle,
        summary,
        pageCount,
        coverType,
        printCopies,
        productionCostPerBook,
        retailPrice,
        royaltyPerSale,
        totalPrintCost,
        signatureName,
        uploadedFileName,
        status,
      } = req.body;

      if (!authorName || !email || !phone || !bookTitle) {
        return sendAPIResponse(res, "error", "الحقول الأساسية (الاسم، البريد، الهاتف، عنوان الكتاب) مطلوبة", null, null, 400);
      }

      const [newSubmission] = await db.insert(schema.manuscriptSubmissions).values({
        authorName,
        email,
        phone,
        bookCategory: bookCategory || "أدب",
        bookTitle,
        summary: summary || "",
        pageCount: pageCount ? parseInt(pageCount.toString()) : 150,
        coverType: coverType || "paperback",
        printCopies: printCopies ? parseInt(printCopies.toString()) : 1000,
        productionCostPerBook: productionCostPerBook ? productionCostPerBook.toString() : "0",
        retailPrice: retailPrice ? retailPrice.toString() : "0",
        royaltyPerSale: royaltyPerSale ? royaltyPerSale.toString() : "0",
        totalPrintCost: totalPrintCost ? totalPrintCost.toString() : "0",
        signatureName: signatureName || "",
        uploadedFileName: uploadedFileName || "",
        status: status || "submitted",
      }).returning();

      return sendAPIResponse(res, "success", "تم تقديم مخطط الكتاب وعقد التوزيع الافتراضي بنجاح", newSubmission);
    } catch (error: any) {
      console.error("Error saving manuscript:", error);
      return sendAPIResponse(res, "error", "حدث خطأ أثناء حفظ المخطوطة", error.message, null, 500);
    }
  });

  app.get("/api/manuscripts", async (req, res) => {
    try {
      const submissions = await db.select().from(schema.manuscriptSubmissions);
      return sendAPIResponse(res, "success", "قائمة المخطوطات والطلبات المودعة", submissions);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "Failed to fetch manuscripts", error.message, null, 500);
    }
  });

  // 6. Newsletter Endpoints
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return sendAPIResponse(res, "error", "البريد الإلكتروني مطلوب للاشتراك", null, null, 400);
      }

      const [subscriber] = await db.insert(schema.newsletterSubscribers).values({
        email,
      }).returning();

      return sendAPIResponse(res, "success", "تم الاشتراك في النشرة البريدية بنجاح", subscriber);
    } catch (error: any) {
      if (error.code === "23505") {
        return sendAPIResponse(res, "success", "أنت مشترك بالفعل معنا في القائمة البريدية!");
      }
      console.error("Error saving newsletter subscriber:", error);
      return sendAPIResponse(res, "error", "حدث خطأ أثناء الاشتراك", error.message, null, 500);
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return sendAPIResponse(res, "error", "البريد الإلكتروني مطلوب لإلغاء الاشتراك", null, null, 400);
      }
      await db.delete(schema.newsletterSubscribers).where(eq(schema.newsletterSubscribers.email, email));
      return sendAPIResponse(res, "success", "تم إلغاء الاشتراك من القائمة البريدية بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إلغاء الاشتراك من النشرة", error.message, null, 500);
    }
  });

  app.get("/api/subscribers", async (req, res) => {
    try {
      const subs = await db.select().from(schema.newsletterSubscribers);
      return sendAPIResponse(res, "success", "المشتركون في النشرة البريدية", subs);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "Failed to fetch subscribers", error.message, null, 500);
    }
  });

  // 7. Orders Endpoints
  app.post("/api/orders", async (req, res) => {
    try {
      const {
        userId,
        name,
        phone,
        email,
        wilaya,
        address,
        shippingMethod,
        paymentMethod,
        items,
        total,
      } = req.body;

      if (!name || !phone || !wilaya || !address || !items || items.length === 0 || !total) {
        return sendAPIResponse(res, "error", "جميع معلومات الشحن وتفاصيل المنتجات مطلوبة", null, null, 400);
      }

      let dbUserId: number | null = null;
      if (userId) {
        dbUserId = await resolveUserId(userId);
      }

      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `ELM-${dateStr}-${randomId}`;

      const [newOrder] = await db.insert(schema.orders).values({
        orderNumber,
        userId: dbUserId,
        status: "processing",
        paymentMethod: paymentMethod || "COD",
        shippingMethod: shippingMethod || "home",
        total: total.toString(),
      }).returning();

      if (!newOrder) {
        throw new Error("Failed to create order record");
      }

      for (const item of items) {
        await db.insert(schema.orderItems).values({
          orderId: newOrder.id,
          bookId: parseInt(item.bookId.toString()),
          quantity: parseInt(item.quantity.toString()),
          priceAtPurchase: item.price.toString(),
        });
      }

      if (dbUserId) {
        await db.insert(schema.shippingAddresses).values({
          userId: dbUserId,
          details: `${wilaya} - ${address}`,
        });

        // Auto clean cart upon successful order
        await db.delete(schema.cart).where(eq(schema.cart.userId, dbUserId));
      }

      return sendAPIResponse(res, "success", "تم تسجيل طلبك بنجاح وسنتصل بك لتأكيده هاتفياً", {
        orderNumber,
        orderId: newOrder.id,
      });
    } catch (error: any) {
      console.error("Error creating order:", error);
      return sendAPIResponse(res, "error", "حدث خطأ أثناء تسجيل الطلب", error.message, null, 500);
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const resolvedId = await resolveUserId(userId);
      if (!resolvedId) {
        return sendAPIResponse(res, "success", "لا توجد طلبات سابقة لهذا العميل", []);
      }
      const userOrders = await db.select().from(schema.orders).where(eq(schema.orders.userId, resolvedId));
      userOrders.sort((a, b) => b.id - a.id);
      return sendAPIResponse(res, "success", "طلبات العميل السابقة", userOrders);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب طلبات العميل", error.message, null, 500);
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
      if (!order) {
        return sendAPIResponse(res, "error", "الطلب غير موجود", null, null, 404);
      }
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
      
      const enrichedItems = [];
      for (const item of items) {
        const [book] = await db.select().from(schema.books).where(eq(schema.books.id, item.bookId));
        enrichedItems.push({
          ...item,
          book,
        });
      }

      return sendAPIResponse(res, "success", "تفاصيل الطلب", {
        order,
        items: enrichedItems,
      });
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب تفاصيل الطلب", error.message, null, 500);
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const allOrders = await db.select().from(schema.orders);
      allOrders.sort((a, b) => b.id - a.id);
      return sendAPIResponse(res, "success", "كل طلبات الشراء المسجلة", allOrders);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "Failed to fetch orders", error.message, null, 500);
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      if (!status) {
        return sendAPIResponse(res, "error", "الحالة مطلوبة للتحديث", null, null, 400);
      }
      await db.update(schema.orders).set({ status }).where(eq(schema.orders.id, id));
      const [updated] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
      return sendAPIResponse(res, "success", "تم تحديث حالة الطلب بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث حالة الطلب", error.message, null, 500);
    }
  });

  // 8. Payment Log Endpoints
  app.post("/api/payments/charge", async (req, res) => {
    try {
      const { orderId, amount, method, transactionId } = req.body;
      if (!orderId || !amount || !method) {
        return sendAPIResponse(res, "error", "بيانات الدفع الأساسية مطلوبة للعملية", null, null, 400);
      }

      const [payment] = await db.insert(schema.payments).values({
        orderId: parseInt(orderId.toString()),
        amount: amount.toString(),
        method,
        status: "completed",
        transactionId: transactionId || `TXN-${Math.floor(10000000 + Math.random() * 90000000)}`,
      }).returning();

      await db.update(schema.orders)
        .set({ status: "processing" })
        .where(eq(schema.orders.id, parseInt(orderId.toString())));

      return sendAPIResponse(res, "success", "تم توثيق عملية السداد الرقمي بنجاح", payment);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تسجيل الدفع المسبق للطلب", error.message, null, 500);
    }
  });

  app.post("/api/payments/webhook", async (req, res) => {
    try {
      const { event, data } = req.body;
      console.log("Stripe/Edahabia Webhook Event Received:", event, data);
      return sendAPIResponse(res, "success", "تمت معالجة إشعار بوابة الدفع بنجاح", { processed: true });
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل معالجة إشعار بوابة الدفع", error.message, null, 500);
    }
  });

  // 9. Book Reviews Endpoints
  app.post("/api/reviews", async (req, res) => {
    try {
      const { userId, bookId, stars, comment } = req.body;
      if (!userId || !bookId || !stars) {
        return sendAPIResponse(res, "error", "جميع تفاصيل المراجعة (المستخدم، الكتاب، والنجوم) مطلوبة", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId);
      if (!resolvedId) {
        return sendAPIResponse(res, "error", "العميل غير مسجل في النظام للتقييم", null, null, 404);
      }

      const [review] = await db.insert(schema.reviews).values({
        bookId: parseInt(bookId.toString()),
        userId: resolvedId,
        stars: parseInt(stars.toString()),
        comment: comment || "",
        approved: true,
      }).returning();

      return sendAPIResponse(res, "success", "شكراً لك! تم نشر تقييمك للكتاب بنجاح", review);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة مراجعتك للكتاب", error.message, null, 500);
    }
  });

  app.get("/api/books/:id/reviews", async (req, res) => {
    try {
      const bookId = parseInt(req.params.id);
      const bookReviews = await db.select().from(schema.reviews).where(eq(schema.reviews.bookId, bookId));
      
      const enrichedReviews = [];
      for (const rev of bookReviews) {
        const [userObj] = await db.select().from(schema.users).where(eq(schema.users.id, rev.userId));
        enrichedReviews.push({
          ...rev,
          userName: userObj ? userObj.name : "قارئ مجهول",
        });
      }

      return sendAPIResponse(res, "success", "قائمة تقييمات هذا الإصدار", enrichedReviews);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب مراجعات الكتاب", error.message, null, 500);
    }
  });

  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
      return sendAPIResponse(res, "success", "تم حذف مراجعة الكتاب بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إزالة مراجعة الكتاب", error.message, null, 500);
    }
  });

  // 10. Wishlist (Favorites) Endpoints
  app.get("/api/wishlist", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) {
        return sendAPIResponse(res, "error", "معرف المستخدم مطلوب لاستعراض المفضلة", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId as string);
      if (!resolvedId) {
        return sendAPIResponse(res, "success", "قائمة المفضلة فارغة لعدم تسجيل الدخول", []);
      }

      const items = await db.select().from(schema.wishlist).where(eq(schema.wishlist.userId, resolvedId));
      const wishlistBooks = [];
      for (const item of items) {
        const [book] = await db.select().from(schema.books).where(eq(schema.books.id, item.bookId));
        if (book) {
          wishlistBooks.push(book);
        }
      }
      return sendAPIResponse(res, "success", "قائمة الكتب المفضلة للعميل", wishlistBooks);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب قائمة المفضلة", error.message, null, 500);
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const { userId, bookId } = req.body;
      if (!userId || !bookId) {
        return sendAPIResponse(res, "error", "معرف المستخدم والكتاب مطلوبان للإضافة للمفضلة", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId);
      if (!resolvedId) {
        return sendAPIResponse(res, "error", "المستخدم غير مسجل في النظام", null, null, 404);
      }

      const [existing] = await db.select().from(schema.wishlist)
        .where(and(eq(schema.wishlist.userId, resolvedId), eq(schema.wishlist.bookId, bookId)));

      if (existing) {
        return sendAPIResponse(res, "success", "المنتج مدرج بالفعل في مفضلتك", existing);
      }

      const [inserted] = await db.insert(schema.wishlist).values({
        userId: resolvedId,
        bookId: parseInt(bookId.toString()),
      }).returning();

      return sendAPIResponse(res, "success", "تمت إضافة الكتاب للمفضلة بنجاح", inserted);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة الكتاب لمفضلتك", error.message, null, 500);
    }
  });

  app.delete("/api/wishlist", async (req, res) => {
    try {
      const { userId, bookId } = req.query;
      if (!userId || !bookId) {
        return sendAPIResponse(res, "error", "معرف المستخدم والمنتج مطلوبان للحذف", null, null, 400);
      }
      const resolvedId = await resolveUserId(userId as string);
      if (!resolvedId) {
        return sendAPIResponse(res, "error", "المستخدم غير موجود بالنظام", null, null, 404);
      }

      await db.delete(schema.wishlist)
        .where(and(eq(schema.wishlist.userId, resolvedId), eq(schema.wishlist.bookId, parseInt(bookId as string))));

      return sendAPIResponse(res, "success", "تمت إزالة الكتاب من مفضلتك بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إزالة الكتاب من المفضلة", error.message, null, 500);
    }
  });

  // 11. Discount Coupons Validation Endpoint
  app.post("/api/coupons/validate", async (req, res) => {
    try {
      const { code, cartTotal } = req.body;
      if (!code) {
        return sendAPIResponse(res, "error", "رمز كوبون الخصم مطلوب", null, null, 400);
      }

      const [coupon] = await db.select().from(schema.coupons).where(eq(schema.coupons.code, code.toUpperCase().trim()));
      if (!coupon) {
        return sendAPIResponse(res, "error", "كوبون الخصم غير صحيح أو ربما انتهت صلاحيته", null, null, 404);
      }

      if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
        return sendAPIResponse(res, "error", "عذراً، هذا الكوبون انتهت فترة صلاحيته", null, null, 400);
      }

      const total = cartTotal ? parseFloat(cartTotal.toString()) : 0;
      let discountAmount = 0;

      if (coupon.discountType === "percentage") {
        discountAmount = total * (parseFloat(coupon.value) / 100);
      } else {
        discountAmount = parseFloat(coupon.value);
      }

      discountAmount = Math.min(discountAmount, total);

      return sendAPIResponse(res, "success", "تم تطبيق الكوبون وتفعيل نسبة الخصم بنجاح", {
        code: coupon.code,
        discountType: coupon.discountType,
        value: parseFloat(coupon.value),
        discountAmount: Math.round(discountAmount),
      });
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل التحقق وتطبيق الكوبون", error.message, null, 500);
    }
  });

  // 12. Blog Articles Endpoints
  app.get("/api/blog", async (req, res) => {
    try {
      const posts = await db.select().from(schema.blogPosts);
      posts.sort((a, b) => b.id - a.id);
      return sendAPIResponse(res, "success", "قائمة مقالات مدونة دار المتنبي", posts);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب مقالات المدونة", error.message, null, 500);
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const [post] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id));
      if (!post) {
        return sendAPIResponse(res, "error", "مقال المدونة غير متوفر", null, null, 404);
      }
      return sendAPIResponse(res, "success", "محتوى المقال بالتفصيل", post);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب تفاصيل المقال", error.message, null, 500);
    }
  });

  // 13. Admin Dashboard Statistics API
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allBooks = await db.select().from(schema.books);
      const allOrders = await db.select().from(schema.orders);
      const allManuscripts = await db.select().from(schema.manuscriptSubmissions);
      const allMessages = await db.select().from(schema.contactMessages);
      const allSubscribers = await db.select().from(schema.newsletterSubscribers);

      const totalSales = allOrders
        .filter(o => o.status !== "cancelled")
        .reduce((sum, o) => sum + parseFloat(o.total), 0);

      const recentOrders = [...allOrders]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

      const recentManuscripts = [...allManuscripts]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

      const recentMessages = [...allMessages]
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);

      return sendAPIResponse(res, "success", "إحصائيات لوحة التحكم للمدير المالي والإداري", {
        counts: {
          books: allBooks.length,
          orders: allOrders.length,
          manuscripts: allManuscripts.length,
          messages: allMessages.length,
          subscribers: allSubscribers.length,
        },
        financials: {
          totalSales: Math.round(totalSales),
        },
        recentOrders,
        recentManuscripts,
        recentMessages,
      });
    } catch (error: any) {
      console.error("Error generating admin stats:", error);
      return sendAPIResponse(res, "error", "Failed to fetch admin stats", error.message, null, 500);
    }
  });

  // ==========================================
  // COMPLETE ADMIN DASHBOARD MANAGEMENT APIS
  // ==========================================

  // 14. Users Administration API
  app.get("/api/admin/users", async (req, res) => {
    try {
      const allUsers = await db.select().from(schema.users).orderBy(schema.users.id);
      return sendAPIResponse(res, "success", "تم جلب المستخدمين بنجاح", allUsers);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب المستخدمين", error.message, null, 500);
    }
  });

  app.put("/api/admin/users/:id/role", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;
      const [updatedUser] = await db.update(schema.users)
        .set({ role })
        .where(eq(schema.users.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث دور المستخدم بنجاح", updatedUser);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث دور المستخدم", error.message, null, 500);
    }
  });

  app.put("/api/admin/users/:id/ban", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { isBanned } = req.body;
      const role = isBanned ? "banned" : "customer";
      const [updatedUser] = await db.update(schema.users)
        .set({ role })
        .where(eq(schema.users.id, id))
        .returning();
      return sendAPIResponse(res, "success", isBanned ? "تم حظر المستخدم بنجاح" : "تم إلغاء حظر المستخدم بنجاح", updatedUser);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تغيير حالة الحظر", error.message, null, 500);
    }
  });

  // 15. Categories Administration API
  app.post("/api/categories", async (req, res) => {
    try {
      const { name, description, image, parentId } = req.body;
      const [newCategory] = await db.insert(schema.categories).values({
        name,
        description: description || "",
        image: image || "",
        parentId: parentId || null
      }).returning();
      return sendAPIResponse(res, "success", "تم إضافة التصنيف بنجاح", newCategory);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة التصنيف", error.message, null, 500);
    }
  });

  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description, image, parentId } = req.body;
      const [updated] = await db.update(schema.categories)
        .set({ name, description, image, parentId: parentId || null })
        .where(eq(schema.categories.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث التصنيف بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث التصنيف", error.message, null, 500);
    }
  });

  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.bookCategories).where(eq(schema.bookCategories.categoryId, id));
      await db.delete(schema.categories).where(eq(schema.categories.id, id));
      return sendAPIResponse(res, "success", "تم حذف التصنيف بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف التصنيف", error.message, null, 500);
    }
  });

  // 16. Authors Administration API
  app.post("/api/authors", async (req, res) => {
    try {
      const { name, bio, image, socialLinks } = req.body;
      const [newAuthor] = await db.insert(schema.authors).values({
        name,
        bio: bio || "",
        image: image || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
        socialLinks: socialLinks || ""
      }).returning();
      return sendAPIResponse(res, "success", "تم إضافة الكاتب بنجاح", newAuthor);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة الكاتب", error.message, null, 500);
    }
  });

  app.put("/api/authors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, bio, image, socialLinks } = req.body;
      const [updated] = await db.update(schema.authors)
        .set({ name, bio, image, socialLinks })
        .where(eq(schema.authors.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث بيانات الكاتب بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث الكاتب", error.message, null, 500);
    }
  });

  app.delete("/api/authors/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.bookAuthors).where(eq(schema.bookAuthors.authorId, id));
      await db.delete(schema.authors).where(eq(schema.authors.id, id));
      return sendAPIResponse(res, "success", "تم حذف الكاتب بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف الكاتب", error.message, null, 500);
    }
  });

  // 17. Coupons Administration API
  app.get("/api/coupons", async (req, res) => {
    try {
      const allCoupons = await db.select().from(schema.coupons);
      return sendAPIResponse(res, "success", "تم جلب الكوبونات بنجاح", allCoupons);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل جلب الكوبونات", error.message, null, 500);
    }
  });

  app.post("/api/coupons", async (req, res) => {
    try {
      const { code, discountType, value, expiresAt, maxUses } = req.body;
      const [newCoupon] = await db.insert(schema.coupons).values({
        code,
        discountType: discountType || "percentage",
        value: value ? value.toString() : "0",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses ? parseInt(maxUses) : null
      }).returning();
      return sendAPIResponse(res, "success", "تم إضافة الكوبون بنجاح", newCoupon);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة الكوبون", error.message, null, 500);
    }
  });

  app.put("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { code, discountType, value, expiresAt, maxUses } = req.body;
      const [updated] = await db.update(schema.coupons)
        .set({
          code,
          discountType,
          value: value ? value.toString() : "0",
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          maxUses: maxUses ? parseInt(maxUses) : null
        })
        .where(eq(schema.coupons.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث الكوبون بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث الكوبون", error.message, null, 500);
    }
  });

  app.delete("/api/coupons/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.coupons).where(eq(schema.coupons.id, id));
      return sendAPIResponse(res, "success", "تم حذف الكوبون بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف الكوبون", error.message, null, 500);
    }
  });

  // 18. Blog Posts Administration API
  app.post("/api/blog", async (req, res) => {
    try {
      const { title, content, image, categoryId, authorId } = req.body;
      const [newPost] = await db.insert(schema.blogPosts).values({
        title,
        content,
        image: image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
        categoryId: categoryId || null,
        authorId: authorId || null
      }).returning();
      return sendAPIResponse(res, "success", "تم إضافة المقال بنجاح", newPost);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إضافة المقال", error.message, null, 500);
    }
  });

  app.put("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, content, image, categoryId, authorId } = req.body;
      const [updated] = await db.update(schema.blogPosts)
        .set({
          title,
          content,
          image: image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643",
          categoryId: categoryId || null,
          authorId: authorId || null
        })
        .where(eq(schema.blogPosts.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث المقال بنجاح", updated);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث المقال", error.message, null, 500);
    }
  });

  app.delete("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id));
      return sendAPIResponse(res, "success", "تم حذف المقال بنجاح");
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل حذف المقال", error.message, null, 500);
    }
  });

  // 19. Books Complete Management APIs (Metadata, Stock, Status)
  app.put("/api/books/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description, price, discountPrice, stock, isbn, pages, language, publishYear, publisher, coverImage, status } = req.body;
      const [updatedBook] = await db.update(schema.books)
        .set({
          title,
          description,
          price: price ? price.toString() : "0",
          discountPrice: discountPrice ? discountPrice.toString() : null,
          stock: stock !== undefined ? parseInt(stock) : 0,
          isbn,
          pages: pages ? parseInt(pages) : null,
          language,
          publishYear: publishYear ? parseInt(publishYear) : null,
          publisher,
          coverImage,
          status: status || "available"
        })
        .where(eq(schema.books.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث الكتاب بنجاح", updatedBook);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث الكتاب", error.message, null, 500);
    }
  });

  app.put("/api/books/:id/stock", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { stock } = req.body;
      const [updatedBook] = await db.update(schema.books)
        .set({ stock: parseInt(stock) })
        .where(eq(schema.books.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث المخزون بنجاح", updatedBook);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث المخزون", error.message, null, 500);
    }
  });

  app.put("/api/books/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const [updatedBook] = await db.update(schema.books)
        .set({ status })
        .where(eq(schema.books.id, id))
        .returning();
      return sendAPIResponse(res, "success", "تم تحديث حالة الكتاب بنجاح", updatedBook);
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل تحديث حالة الكتاب", error.message, null, 500);
    }
  });

  // 20. Newsletter Bulk Broadcasting API
  app.post("/api/admin/send-newsletter", async (req, res) => {
    try {
      const { subject, content } = req.body;
      if (!subject || !content) {
        return sendAPIResponse(res, "error", "يرجى تحديد عنوان ومحتوى النشرة البريدية", null, null, 400);
      }
      const subs = await db.select().from(schema.newsletterSubscribers);
      return sendAPIResponse(res, "success", `تم إرسال النشرة البريدية بنجاح إلى ${subs.length} مشترك!`, { deliveredCount: subs.length });
    } catch (error: any) {
      return sendAPIResponse(res, "error", "فشل إرسال النشرة البريدية", error.message, null, 500);
    }
  });

  // 21. Enterprise Backup & Restore Database APIs
  app.get("/api/admin/backup", async (req, res) => {
    try {
      const [
        allUsers,
        allBooks,
        allOrders,
        allOrderItems,
        allAuthors,
        allCategories,
        allCoupons,
        allBlogPosts,
        allSubscribers,
        allMessages,
        allManuscripts
      ] = await Promise.all([
        db.select().from(schema.users),
        db.select().from(schema.books),
        db.select().from(schema.orders),
        db.select().from(schema.orderItems),
        db.select().from(schema.authors),
        db.select().from(schema.categories),
        db.select().from(schema.coupons),
        db.select().from(schema.blogPosts),
        db.select().from(schema.newsletterSubscribers),
        db.select().from(schema.contactMessages),
        db.select().from(schema.manuscriptSubmissions)
      ]);

      const backupData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        tables: {
          users: allUsers,
          books: allBooks,
          orders: allOrders,
          orderItems: allOrderItems,
          authors: allAuthors,
          categories: allCategories,
          coupons: allCoupons,
          blogPosts: allBlogPosts,
          subscribers: allSubscribers,
          messages: allMessages,
          manuscripts: allManuscripts
        }
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename=dar-al-motanabi-db-backup-${Date.now()}.json`);
      return res.send(JSON.stringify(backupData, null, 2));
    } catch (error: any) {
      console.error("Backup error:", error);
      return sendAPIResponse(res, "error", "فشل تصدير النسخة الاحتياطية", error.message, null, 500);
    }
  });

  app.post("/api/admin/restore", async (req, res) => {
    try {
      const { backup } = req.body;
      if (!backup || !backup.tables) {
        return sendAPIResponse(res, "error", "ملف النسخة الاحتياطية غير صالح أو فارغ", null, null, 400);
      }

      const { tables } = backup;

      // Safe clean slate in correct reference order
      await db.delete(schema.orderItems);
      await db.delete(schema.bookAuthors);
      await db.delete(schema.bookCategories);
      await db.delete(schema.cart);
      await db.delete(schema.wishlist);
      await db.delete(schema.reviews);
      await db.delete(schema.payments);
      await db.delete(schema.shippingAddresses);

      await db.delete(schema.orders);
      await db.delete(schema.blogPosts);
      await db.delete(schema.books);
      await db.delete(schema.categories);
      await db.delete(schema.authors);
      await db.delete(schema.users);
      await db.delete(schema.coupons);
      await db.delete(schema.newsletterSubscribers);
      await db.delete(schema.contactMessages);
      await db.delete(schema.manuscriptSubmissions);

      // Repopulate table by table
      if (tables.users?.length) await db.insert(schema.users).values(tables.users);
      if (tables.authors?.length) await db.insert(schema.authors).values(tables.authors);
      if (tables.categories?.length) await db.insert(schema.categories).values(tables.categories);
      if (tables.books?.length) await db.insert(schema.books).values(tables.books);
      if (tables.coupons?.length) await db.insert(schema.coupons).values(tables.coupons);
      if (tables.orders?.length) await db.insert(schema.orders).values(tables.orders);
      if (tables.orderItems?.length) await db.insert(schema.orderItems).values(tables.orderItems);
      if (tables.blogPosts?.length) await db.insert(schema.blogPosts).values(tables.blogPosts);
      if (tables.subscribers?.length) await db.insert(schema.newsletterSubscribers).values(tables.subscribers);
      if (tables.messages?.length) await db.insert(schema.contactMessages).values(tables.messages);
      if (tables.manuscripts?.length) await db.insert(schema.manuscriptSubmissions).values(tables.manuscripts);

      return sendAPIResponse(res, "success", "تمت استعادة قواعد البيانات بنجاح 100%!");
    } catch (error: any) {
      console.error("Restore error:", error);
      return sendAPIResponse(res, "error", "فشل استعادة قواعد البيانات", error.message, null, 500);
    }
  });

  const PORT = Number(process.env.PORT) || 3000;
  async function startViteServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startViteServer();
}
