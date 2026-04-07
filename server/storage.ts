import {
  type User,
  type InsertUser,
  type Collection,
  type InsertCollection,
  type Product,
  type InsertProduct,
  type Inquiry,
  type InsertInquiry,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type Image,
  type InsertImage,
  type ShippingRate,
  type InsertShippingRate,
  users,
  collections,
  products,
  images,
  inquiries,
  cartItems,
  orders,
  orderItems,
  shippingRates,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: string, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: string): Promise<boolean>;
  
  getProducts(): Promise<Product[]>;
  getProductsByCollection(collectionId: string): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  searchProducts(query: string): Promise<Product[]>;
  decrementProductStock(productId: string, amount: number): Promise<Product | undefined>;
  decrementProductStocks(items: { productId: string; quantity: number }[]): Promise<void>;
  
  getInquiries(): Promise<Inquiry[]>;
  getInquiry(id: string): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  updateInquiry(id: string, inquiry: Partial<InsertInquiry>): Promise<Inquiry | undefined>;
  updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined>;
  deleteInquiry(id: string): Promise<boolean>;
  
  getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]>;
  addCartItem(item: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: string, quantity: number, userId?: string, sessionId?: string): Promise<CartItem | undefined>;
  removeCartItem(id: string, userId?: string, sessionId?: string): Promise<boolean>;
  clearCart(userId?: string, sessionId?: string): Promise<boolean>;
  mergeGuestCart(sessionId: string, userId: string): Promise<void>;
  
  getOrders(userId: string): Promise<Order[]>;
  getOrder(id: string, userId: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  getShippingRates(): Promise<ShippingRate[]>;
  getShippingRateByState(state: string): Promise<ShippingRate | undefined>;
  createShippingRate(rate: InsertShippingRate): Promise<ShippingRate>;
  updateShippingRate(id: string, updates: Partial<InsertShippingRate>): Promise<ShippingRate | undefined>;
  
  getAllOrders(): Promise<Order[]>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  getAdminStats(): Promise<{ totalProducts: number; totalOrders: number; pendingInquiries: number; totalCollections: number }>;
  createImage(image: InsertImage): Promise<Image>;
  getImage(id: string): Promise<Image | undefined>;
}

export class DatabaseStorage implements IStorage {

  async createImage(image: InsertImage): Promise<Image> {
    const [img] = await db.insert(images).values(image).returning();
    return img;
  }

  async getImage(id: string): Promise<Image | undefined> {
    const [img] = await db.select().from(images).where(eq(images.id, id));
    return img || undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection || undefined;
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const [collection] = await db
      .insert(collections)
      .values(insertCollection)
      .returning();
    return collection;
  }

  async updateCollection(id: string, updates: Partial<InsertCollection>): Promise<Collection | undefined> {
    const [collection] = await db
      .update(collections)
      .set(updates)
      .where(eq(collections.id, id))
      .returning();
    return collection || undefined;
  }

  async deleteCollection(id: string): Promise<boolean> {
    const result = await db.delete(collections).where(eq(collections.id, id)).returning();
    return result.length > 0;
  }

  async getProducts(): Promise<Product[]> {
    const prods = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        collectionId: products.collectionId,
        imageUrl: products.imageUrl,
        imageId: products.imageId,
        inStock: products.inStock,
        createdAt: products.createdAt,
        imagePath: images.path,
      })
      .from(products)
      .leftJoin(images, eq(products.imageId, images.id));

    return prods.map((p) => ({
      ...p,
      imageUrl: p.imageUrl || p.imagePath || undefined,
    }));
  }

  async getProductsByCollection(collectionId: string): Promise<Product[]> {
    const prods = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        collectionId: products.collectionId,
        imageUrl: products.imageUrl,
        imageId: products.imageId,
        inStock: products.inStock,
        createdAt: products.createdAt,
        imagePath: images.path,
      })
      .from(products)
      .where(eq(products.collectionId, collectionId))
      .leftJoin(images, eq(products.imageId, images.id));

    return prods.map((p) => ({
      ...p,
      imageUrl: p.imageUrl || p.imagePath || undefined,
    }));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return undefined;
    if (product.imageId) {
      const [img] = await db.select().from(images).where(eq(images.id, product.imageId));
      if (img) (product as any).imageUrl = img.path;
    }
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id)).returning();
    return result.length > 0;
  }

  async decrementProductStock(productId: string, amount: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, productId));
    if (!product || product.inStock < amount) {
      return undefined;
    }

    const [updated] = await db
      .update(products)
      .set({ inStock: product.inStock - amount })
      .where(eq(products.id, productId))
      .returning();

    return updated || undefined;
  }

  async decrementProductStocks(items: { productId: string; quantity: number }[]): Promise<void> {
    console.log("[DECREMENT] Starting stock decrement for items:", items);
    for (const item of items) {
      console.log(`[DECREMENT] Processing item: productId=${item.productId}, quantity=${item.quantity}`);
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      console.log(`[DECREMENT] Product retrieved:`, product);
      if (!product || product.inStock < item.quantity) {
        console.error(`[DECREMENT] Stock check failed for ${item.productId}: product exists=${!!product}, inStock=${product?.inStock || 0}, needed=${item.quantity}`);
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }
      const newStock = product.inStock - item.quantity;
      console.log(`[DECREMENT] Updating product ${item.productId}: inStock ${product.inStock} -> ${newStock}`);
      const updateResult = await db
        .update(products)
        .set({ inStock: newStock })
        .where(eq(products.id, item.productId));
      console.log(`[DECREMENT] Update result:`, updateResult);
      
      // Verify the update
      const [updatedProduct] = await db.select().from(products).where(eq(products.id, item.productId));
      console.log(`[DECREMENT] Verification - product after update:`, updatedProduct);
    }
    console.log("[DECREMENT] Stock decrement completed");
  }

  async searchProducts(query: string): Promise<Product[]> {
    const prods = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        collectionId: products.collectionId,
        imageUrl: products.imageUrl,
        imageId: products.imageId,
        inStock: products.inStock,
        createdAt: products.createdAt,
        imagePath: images.path,
      })
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.description, `%${query}%`)
        )
      )
      .leftJoin(images, eq(products.imageId, images.id));

    return prods.map((p) => ({
      ...p,
      imageUrl: p.imageUrl || p.imagePath || undefined,
    }));
  }

  async getInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries);
  }

  async getInquiry(id: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values(insertInquiry)
      .returning();
    return inquiry;
  }

  async updateInquiry(id: string, updates: Partial<InsertInquiry>): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .update(inquiries)
      .set(updates)
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry || undefined;
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry || undefined;
  }

  async deleteInquiry(id: string): Promise<boolean> {
    const result = await db.delete(inquiries).where(eq(inquiries.id, id)).returning();
    return result.length > 0;
  }

  async getCartItems(userId?: string, sessionId?: string): Promise<CartItem[]> {
    if (!userId && !sessionId) {
      return [];
    }

    if (userId) {
      return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
    } else if (sessionId) {
      return await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    }
    
    return [];
  }

  async addCartItem(item: InsertCartItem): Promise<CartItem> {
    if (!item.userId && !item.sessionId) {
      throw new Error("Cart item must have either userId or sessionId");
    }

    const whereConditions = [eq(cartItems.productId, item.productId)];
    if (item.userId) {
      whereConditions.push(eq(cartItems.userId, item.userId));
    } else if (item.sessionId) {
      whereConditions.push(eq(cartItems.sessionId, item.sessionId));
    }

    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(and(...whereConditions));

    if (existingItem) {
      const [updated] = await db
        .update(cartItems)
        .set({ quantity: existingItem.quantity + (item.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updated;
    }

    const [newItem] = await db
      .insert(cartItems)
      .values(item)
      .returning();
    return newItem;
  }

  async updateCartItemQuantity(id: string, quantity: number, userId?: string, sessionId?: string): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await this.removeCartItem(id, userId, sessionId);
      return undefined;
    }

    const whereConditions = [eq(cartItems.id, id)];
    if (userId) {
      whereConditions.push(eq(cartItems.userId, userId));
    } else if (sessionId) {
      whereConditions.push(eq(cartItems.sessionId, sessionId));
    }

    const [item] = await db
      .update(cartItems)
      .set({ quantity })
      .where(and(...whereConditions))
      .returning();
    return item || undefined;
  }

  async removeCartItem(id: string, userId?: string, sessionId?: string): Promise<boolean> {
    const whereConditions = [eq(cartItems.id, id)];
    if (userId) {
      whereConditions.push(eq(cartItems.userId, userId));
    } else if (sessionId) {
      whereConditions.push(eq(cartItems.sessionId, sessionId));
    }

    const result = await db
      .delete(cartItems)
      .where(and(...whereConditions))
      .returning();
    return result.length > 0;
  }

  async clearCart(userId?: string, sessionId?: string): Promise<boolean> {
    if (!userId && !sessionId) {
      return false;
    }

    let result;
    if (userId) {
      result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    } else if (sessionId) {
      result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId)).returning();
    }
    
    return result ? result.length > 0 : false;
  }

  async mergeGuestCart(sessionId: string, userId: string): Promise<void> {
    const guestItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId));

    for (const item of guestItems) {
      const [existingUserItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.userId, userId),
            eq(cartItems.productId, item.productId)
          )
        );

      if (existingUserItem) {
        await db
          .update(cartItems)
          .set({ quantity: existingUserItem.quantity + item.quantity })
          .where(eq(cartItems.id, existingUserItem.id));
      } else {
        await db
          .update(cartItems)
          .set({ userId, sessionId: null })
          .where(eq(cartItems.id, item.id));
      }
    }

    await db.delete(cartItems).where(
      and(
        eq(cartItems.sessionId, sessionId),
        isNull(cartItems.userId)
      )
    );
  }

  async getOrders(userId: string): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async getOrder(id: string, userId: string): Promise<Order | undefined> {
    const [order] = await db
      .select()
      .from(orders)
      .where(and(eq(orders.id, id), eq(orders.userId, userId)));
    return order || undefined;
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set(updates)
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder, items: Omit<InsertOrderItem, "orderId">[]): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();

    if (items.length > 0) {
      await db.insert(orderItems).values(
        items.map(item => ({ ...item, orderId: order.id }))
      );
    }

    return order;
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async getShippingRates(): Promise<ShippingRate[]> {
    return await db.select().from(shippingRates);
  }

  async getShippingRateByState(state: string): Promise<ShippingRate | undefined> {
    const [rate] = await db.select().from(shippingRates).where(eq(shippingRates.state, state));
    return rate || undefined;
  }

  async createShippingRate(rate: InsertShippingRate): Promise<ShippingRate> {
    const [created] = await db.insert(shippingRates).values(rate).returning();
    return created;
  }

  async updateShippingRate(id: string, updates: Partial<InsertShippingRate>): Promise<ShippingRate | undefined> {
    const [updated] = await db.update(shippingRates).set(updates).where(eq(shippingRates.id, id)).returning();
    return updated || undefined;
  }

  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    return this.updateOrder(id, { status });
  }

  async getAdminStats(): Promise<{ totalProducts: number; totalOrders: number; pendingInquiries: number; totalCollections: number }> {
    const allProducts = await db.select().from(products);
    const allOrders = await db.select().from(orders);
    const allInquiries = await db.select().from(inquiries);
    const allCollections = await db.select().from(collections);
    
    return {
      totalProducts: allProducts.length,
      totalOrders: allOrders.length,
      pendingInquiries: allInquiries.filter(i => i.status === 'pending').length,
      totalCollections: allCollections.length,
    };
  }
}

export const storage = new DatabaseStorage();
