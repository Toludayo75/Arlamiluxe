  import { sql } from "drizzle-orm";
  import { pgTable, text, varchar, integer, timestamp, index } from "drizzle-orm/pg-core";
  import { createInsertSchema } from "drizzle-zod";
  import { z } from "zod";

  export const users = pgTable("users", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    role: text("role").default("customer").notNull(),
  });

  export const collections = pgTable("collections", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    title: text("title").notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    titleIdx: index("collections_title_idx").on(table.title),
  }));

  export const products = pgTable("products", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: text("name").notNull(),
    description: text("description"),
    price: integer("price").notNull(),
    collectionId: varchar("collection_id").references(() => collections.id, { onDelete: 'cascade' }),
    imageUrl: text("image_url"),
    imageId: varchar("image_id").references(() => images.id, { onDelete: 'set null' }),
    inStock: integer("in_stock").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    collectionIdIdx: index("products_collection_id_idx").on(table.collectionId),
    nameIdx: index("products_name_idx").on(table.name),
    nameDescriptionIdx: index("products_name_description_idx").on(table.name, table.description),
  }));

  export const images = pgTable("images", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    filename: text("filename").notNull(),
    path: text("path").notNull(),
    mime: text("mime"),
    size: integer("size"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });

  export const inquiries = pgTable("inquiries", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    customerName: text("customer_name").notNull(),
    phone: text("phone").notNull(),
    email: text("email"),
    productId: varchar("product_id").references(() => products.id, { onDelete: 'set null' }),
    message: text("message"),
    status: text("status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  });

  export const cartItems = pgTable("cart_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
    sessionId: text("session_id"),
    productId: varchar("product_id").references(() => products.id, { onDelete: 'cascade' }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    userIdIdx: index("cart_items_user_id_idx").on(table.userId),
    sessionIdIdx: index("cart_items_session_id_idx").on(table.sessionId),
    userIdSessionIdIdx: index("cart_items_user_session_idx").on(table.userId, table.sessionId),
  }));

  export const orders = pgTable("orders", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    total: integer("total").notNull(),
    shippingState: text("shipping_state"),
    shippingFee: integer("shipping_fee").default(0).notNull(),
    shippingAddress: text("shipping_address"),
    shippingPhone: text("shipping_phone"),
    status: text("status").default("pending").notNull(),
    paymentStatus: text("payment_status").default("pending").notNull(),
    paymentReference: text("payment_reference"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    statusIdx: index("orders_status_idx").on(table.status),
    paymentStatusIdx: index("orders_payment_status_idx").on(table.paymentStatus),
  }));

  export const shippingRates = pgTable("shipping_rates", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    state: text("state").notNull().unique(),
    fee: integer("fee").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }, (table) => ({
    stateIdx: index("shipping_rates_state_idx").on(table.state),
  }));

  export const orderItems = pgTable("order_items", {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    orderId: varchar("order_id").references(() => orders.id, { onDelete: 'cascade' }).notNull(),
    productId: varchar("product_id").references(() => products.id, { onDelete: 'set null' }),
    productName: text("product_name").notNull(),
    price: integer("price").notNull(),
    quantity: integer("quantity").notNull(),
  }, (table) => ({
    orderIdIdx: index("order_items_order_id_idx").on(table.orderId),
    productIdIdx: index("order_items_product_id_idx").on(table.productId),
  }));

  export const insertUserSchema = createInsertSchema(users).omit({
    id: true,
  });

  export const insertCollectionSchema = createInsertSchema(collections).omit({
    id: true,
    createdAt: true,
  });

  export const insertProductSchema = createInsertSchema(products).omit({
    id: true,
    createdAt: true,
  });

  export const insertImageSchema = createInsertSchema(images).omit({
    id: true,
    createdAt: true,
  });

  export const insertInquirySchema = createInsertSchema(inquiries).omit({
    id: true,
    createdAt: true,
    status: true,
  });

  export const insertCartItemSchema = createInsertSchema(cartItems).omit({
    id: true,
    createdAt: true,
  });

  export const insertOrderSchema = createInsertSchema(orders).omit({
    id: true,
    createdAt: true,
  });

  export const insertShippingRateSchema = createInsertSchema(shippingRates).omit({
    id: true,
    createdAt: true,
  });

  export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
    id: true,
  });

  export type InsertUser = z.infer<typeof insertUserSchema>;
  export type User = typeof users.$inferSelect;

  export type InsertCollection = z.infer<typeof insertCollectionSchema>;
  export type Collection = typeof collections.$inferSelect;

  export type InsertProduct = z.infer<typeof insertProductSchema>;
  export type Product = typeof products.$inferSelect;

  export type InsertImage = z.infer<typeof insertImageSchema>;
  export type Image = typeof images.$inferSelect;

  export type InsertInquiry = z.infer<typeof insertInquirySchema>;
  export type Inquiry = typeof inquiries.$inferSelect;

  export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
  export type CartItem = typeof cartItems.$inferSelect;

  export type InsertOrder = z.infer<typeof insertOrderSchema>;
  export type Order = typeof orders.$inferSelect;

  export type InsertShippingRate = z.infer<typeof insertShippingRateSchema>;
  export type ShippingRate = typeof shippingRates.$inferSelect;

  export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
  export type OrderItem = typeof orderItems.$inferSelect;
