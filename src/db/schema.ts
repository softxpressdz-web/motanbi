import { relations } from 'drizzle-orm';
import { integer, numeric, pgTable, serial, text, timestamp, boolean, primaryKey } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  name: text('name'),
  email: text('email').notNull(),
  phone: text('phone'),
  address: text('address'),
  role: text('role').default('customer'), // customer, admin, editor
  createdAt: timestamp('created_at').defaultNow(),
});

export const authors = pgTable('authors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  bio: text('bio'),
  image: text('image'),
  socialLinks: text('social_links'), // JSON string or simple text for now
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  image: text('image'),
  parentId: integer('parent_id'),
});

export const books = pgTable('books', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  discountPrice: numeric('discount_price', { precision: 10, scale: 2 }),
  stock: integer('stock').default(0),
  isbn: text('isbn'),
  pages: integer('pages'),
  language: text('language'),
  publishYear: integer('publish_year'),
  publisher: text('publisher'),
  coverImage: text('cover_image'),
  images: text('images').array(),
  tableOfContents: text('table_of_contents'),
  status: text('status').default('available'), // available, unavailable
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookAuthors = pgTable('book_authors', {
  bookId: integer('book_id').notNull().references(() => books.id),
  authorId: integer('author_id').notNull().references(() => authors.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.bookId, t.authorId] }),
}));

export const bookCategories = pgTable('book_categories', {
  bookId: integer('book_id').notNull().references(() => books.id),
  categoryId: integer('category_id').notNull().references(() => categories.id),
}, (t) => ({
  pk: primaryKey({ columns: [t.bookId, t.categoryId] }),
}));

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: integer('user_id').references(() => users.id),
  status: text('status').default('processing'), // processing, shipped, completed, cancelled
  paymentMethod: text('payment_method'),
  shippingMethod: text('shipping_method'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  bookId: integer('book_id').notNull().references(() => books.id),
  quantity: integer('quantity').notNull().default(1),
  priceAtPurchase: numeric('price_at_purchase', { precision: 10, scale: 2 }).notNull(),
});

export const cart = pgTable('cart', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  bookId: integer('book_id').notNull().references(() => books.id),
  quantity: integer('quantity').notNull().default(1),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  bookId: integer('book_id').notNull().references(() => books.id),
  userId: integer('user_id').notNull().references(() => users.id),
  stars: integer('stars').notNull(),
  comment: text('comment'),
  approved: boolean('approved').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const wishlist = pgTable('wishlist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  bookId: integer('book_id').notNull().references(() => books.id),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountType: text('discount_type').notNull(), // percentage, fixed
  value: numeric('value', { precision: 10, scale: 2 }).notNull(),
  expiresAt: timestamp('expires_at'),
  maxUses: integer('max_uses'),
});

export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  image: text('image'),
  authorId: integer('author_id').references(() => users.id),
  categoryId: integer('category_id').references(() => categories.id),
  publishedAt: timestamp('published_at').defaultNow(),
});

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const shippingAddresses = pgTable('shipping_addresses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  details: text('details').notNull(),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(), // pending, completed, failed
  method: text('method').notNull(),
  transactionId: text('transaction_id'),
});

export const contactMessages = pgTable('contact_messages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  status: text('status').default('unread'), // unread, read, archived, replied
  createdAt: timestamp('created_at').defaultNow(),
});

export const manuscriptSubmissions = pgTable('manuscript_submissions', {
  id: serial('id').primaryKey(),
  authorName: text('author_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  bookCategory: text('book_category').notNull(),
  bookTitle: text('book_title').notNull(),
  summary: text('summary'),
  pageCount: integer('page_count').notNull(),
  coverType: text('cover_type').notNull(),
  printCopies: integer('print_copies').notNull(),
  productionCostPerBook: numeric('production_cost_per_book', { precision: 10, scale: 2 }),
  retailPrice: numeric('retail_price', { precision: 10, scale: 2 }),
  royaltyPerSale: numeric('royalty_per_sale', { precision: 10, scale: 2 }),
  totalPrintCost: numeric('total_print_cost', { precision: 10, scale: 2 }),
  signatureName: text('signature_name'),
  uploadedFileName: text('uploaded_file_name'),
  status: text('status').default('submitted'), // submitted, contract_signed, in_review, accepted, printed
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const booksRelations = relations(books, ({ many }) => ({
  bookAuthors: many(bookAuthors),
  bookCategories: many(bookCategories),
  reviews: many(reviews),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  bookAuthors: many(bookAuthors),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  bookCategories: many(bookCategories),
}));

export const bookAuthorsRelations = relations(bookAuthors, ({ one }) => ({
  book: one(books, { fields: [bookAuthors.bookId], references: [books.id] }),
  author: one(authors, { fields: [bookAuthors.authorId], references: [authors.id] }),
}));

export const bookCategoriesRelations = relations(bookCategories, ({ one }) => ({
  book: one(books, { fields: [bookCategories.bookId], references: [books.id] }),
  category: one(categories, { fields: [bookCategories.categoryId], references: [categories.id] }),
}));
