import { z } from "zod";

/* USERS */
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["customer", "admin"]).optional(),
});

/* COLLECTIONS */
export const insertCollectionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
});

/* PRODUCTS */
export const insertProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
  collectionId: z.string().optional(),
  imageUrl: z.string().url().optional(),
  inStock: z.number().min(0).optional(),
});

/* INQUIRIES */
export const insertInquirySchema = z.object({
  customerName: z.string().min(1),
  phone: z.string().min(5),
  email: z.string().email().optional(),
  productId: z.string().optional(),
  message: z.string().optional(),
});

/* CART */
export const insertCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(1),
});
