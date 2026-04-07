import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { requireAdmin } from "./admin-middleware";
import { initializePaystackTransaction, verifyPaystackTransaction, verifyPaystackWebhookSignature } from "./paystack.ts";
import multer from "multer";
import path from "path";
import fs from "fs";
import { z } from "zod";
import {
  insertCollectionSchema,
  insertProductSchema,
  insertInquirySchema,
  insertCartItemSchema,
  insertOrderSchema,
  insertShippingRateSchema,
  type InsertOrderItem,
  type InsertShippingRate,
} from "@shared/schema";

// Configure multer for image uploads
const storage_multer = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
  storage: storage_multer,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG and WebP are allowed."));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});


function getAuthenticatedUserId(req: Express.Request) {
  return req.session?.userId || (req.user as { id?: string })?.id;
}

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);
  
  // ensure upload directory exists and configure multer (store locally under uploads/ for temp storage)
  const uploadDir = path.resolve(import.meta.dirname, "..", "uploads", );
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
  
  // Serve uploaded images as static files
  app.use("/uploads", express.static(uploadDir));
  
  // Also serve generated_images for dev/prod
  const generatedImagesDir = path.resolve(import.meta.dirname, "..", "client", "src", "assets", "generated_images");
  if (fs.existsSync(generatedImagesDir)) {
    app.use("/generated_images", express.static(generatedImagesDir));
  }

  const storageEngine = multer.diskStorage({
    destination: uploadDir,
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || "";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });

  const upload = multer({ storage: storageEngine, limits: { fileSize: 10 * 1024 * 1024 } });

  // image upload endpoint used by admin form
  app.post("/api/admin/upload", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      // multer attaches file info to req.file
      // return a relative path consistent with seeded assets
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });
      const filename = req.file.filename;
      // Determine what to persist as the image `path` in the DB.
      // - If `ASSETS_BASE_URL` is configured, persist the full public URL.
      // - Otherwise persist the /uploads/ path so it can be served by the static middleware.
      // The API will return exactly what is stored in the DB so the frontend uses the DB-provided path.
      const assetsBase = process.env.ASSETS_BASE_URL ? process.env.ASSETS_BASE_URL.replace(/\/$/, "") : null;
      const imageUrl = assetsBase ? `${assetsBase}/generated_images/${filename}` : `/uploads/${filename}`;

      // persist image metadata to database and return its id
      try {
        const img = await storage.createImage({ filename, path: imageUrl, mime: req.file.mimetype, size: req.file.size });
        return res.status(201).json({ imageId: img.id, imageUrl });
      } catch (err) {
        // if DB save fails, still return URL but log the error
        console.error("Failed to save image record:", err);
        return res.status(201).json({ imageUrl });
      }
    } catch (error) {
      res.status(500).json({ error: "Upload failed" });
    }
  });
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:id", async (req, res) => {
    try {
      const collection = await storage.getCollection(req.params.id);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collection" });
    }
  });

  app.post("/api/collections", requireAdmin, async (req, res) => {
    const validation = insertCollectionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid collection data", details: validation.error });
    }
    
    try {
      const collection = await storage.createCollection(validation.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create collection" });
    }
  });

  app.put("/api/collections/:id", requireAdmin, async (req, res) => {
    const validation = insertCollectionSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid collection data", details: validation.error });
    }
    
    try {
      const collection = await storage.updateCollection(req.params.id, validation.data);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  app.delete("/api/collections/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCollection(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      const collectionId = (req.query.collectionId || req.query.collection) as string | undefined;
      const search = req.query.search as string | undefined;
      
      let products;
      
      if (search) {
        products = await storage.searchProducts(search);
        if (collectionId) {
          products = products.filter(p => p.collectionId === collectionId);
        }
      } else if (collectionId) {
        products = await storage.getProductsByCollection(collectionId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireAdmin, async (req, res) => {
    const validation = insertProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid product data", details: validation.error });
    }
    
    try {
      const product = await storage.createProduct(validation.data);
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", requireAdmin, async (req, res) => {
    const validation = insertProductSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid product data", details: validation.error });
    }
    
    try {
      const product = await storage.updateProduct(req.params.id, validation.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/inquiries", async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.get("/api/inquiries/:id", async (req, res) => {
    try {
      const inquiry = await storage.getInquiry(req.params.id);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiry" });
    }
  });

  app.post("/api/inquiries", async (req, res) => {
    const validation = insertInquirySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid inquiry data", details: validation.error });
    }
    
    try {
      const inquiry = await storage.createInquiry(validation.data);
      res.status(201).json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to create inquiry" });
    }
  });

  app.put("/api/inquiries/:id", requireAdmin, async (req, res) => {
    const validation = insertInquirySchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid inquiry data", details: validation.error });
    }
    
    try {
      const inquiry = await storage.updateInquiry(req.params.id, validation.data);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inquiry" });
    }
  });

  app.patch("/api/inquiries/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    try {
      const inquiry = await storage.updateInquiryStatus(req.params.id, status);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inquiry status" });
    }
  });

  app.delete("/api/inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteInquiry(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete inquiry" });
    }
  });

  app.get("/api/cart", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      
      const items = await storage.getCartItems(userId, sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch cart items" });
    }
  });

  app.get("/api/shipping-rates", async (req, res) => {
    try {
      const rates = await storage.getShippingRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to load shipping rates" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    const validation = insertCartItemSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid cart item data", details: validation.error });
    }

    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;

      if (!userId && !sessionId) {
        return res.status(401).json({ error: "Unauthorized - no valid session" });
      }

      const itemData = {
        ...validation.data,
        userId: userId || null,
        sessionId: userId ? null : sessionId,
      };

      const item = await storage.addCartItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to add cart item" });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    const { quantity } = req.body;
    if (typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }

    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;

      const item = await storage.updateCartItemQuantity(req.params.id, quantity, userId, sessionId);
      if (!item) {
        return res.status(204).send();
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;

      const success = await storage.removeCartItem(req.params.id, userId, sessionId);
      if (!success) {
        return res.status(404).json({ error: "Cart item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to remove cart item" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      await storage.clearCart(userId, sessionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to clear cart" });
    }
  });

  app.post("/api/payments/paystack/initialize", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      const sessionId = req.sessionID;
      if (!userId) {
        console.error("Paystack init unauthorized: missing userId", {
          sessionId,
          cookie: req.headers.cookie,
          session: req.session,
          user: req.user,
        });
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        console.error("Paystack init unauthorized: user not found", { userId, sessionId });
        return res.status(401).json({ error: "Unauthorized" });
      }

      const shippingInfoSchema = z.object({
        shippingState: z.string().min(1),
        shippingAddress: z.string().min(1),
        shippingPhone: z.string().optional(),
      });

      const validation = shippingInfoSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid shipping data", details: validation.error });
      }

      const { shippingState, shippingAddress, shippingPhone } = validation.data;

      const rate = await storage.getShippingRateByState(shippingState);
      if (!rate) {
        return res.status(400).json({ error: `Shipping is not available for ${shippingState}` });
      }

      const cartItems = await storage.getCartItems(userId, sessionId);
      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }

      let subtotal = 0;
      const items: Omit<InsertOrderItem, "orderId">[] = [];

      for (const cartItem of cartItems) {
        const product = await storage.getProduct(cartItem.productId);
        if (!product) {
          return res.status(400).json({ error: `Product not found: ${cartItem.productId}` });
        }

        if (product.inStock < cartItem.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.name}. Available: ${product.inStock}` });
        }

        subtotal += product.price * cartItem.quantity;
        items.push({
          productId: product.id,
          productName: product.name,
          price: product.price,
          quantity: cartItem.quantity,
        });
      }

      if (subtotal <= 0) {
        return res.status(400).json({ error: "Invalid cart total" });
      }

      const total = subtotal + rate.fee;

      const order = await storage.createOrder(
        {
          userId,
          total,
          shippingState,
          shippingAddress,
          shippingPhone,
          shippingFee: rate.fee,
          status: "pending",
          paymentStatus: "pending",
        },
        items
      );

      const callbackUrl = process.env.PAYSTACK_CALLBACK_URL ?? "http://localhost:5173/payment-success";
      const result = await initializePaystackTransaction({
        amount: total * 100,
        email: user.email,
        reference: order.id,
        callbackUrl,
      });

      if (!result.status || !result.data?.authorization_url) {
        console.error("Paystack initialization failed", result);
        return res.status(502).json({ error: "Paystack initialization failed", details: result });
      }

      await storage.updateOrder(order.id, {
        paymentReference: result.data.reference ?? order.id,
      });

      res.json({
        authorization_url: result.data.authorization_url,
        reference: result.data.reference ?? order.id,
        orderId: order.id,
      });
    } catch (error) {
      console.error("Paystack initialize failed:", error);
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  app.get("/api/payments/paystack/verify", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const reference = (req.query.reference as string) || (req.query.trxref as string);
      if (!reference) {
        return res.status(400).json({ error: "Missing payment reference" });
      }

      console.log(`[VERIFY] Processing payment reference: ${reference}`);

      const result = await verifyPaystackTransaction(reference);
      if (!result.status || result.data?.status !== "success") {
        return res.status(400).json({ error: "Payment not successful" });
      }

      const order = await storage.getOrderById(reference);
      console.log(`[VERIFY] Order found:`, order);
      if (!order || order.userId !== userId) {
        return res.status(404).json({ error: "Order not found" });
      }

      console.log(`[VERIFY] Order paymentStatus: ${order.paymentStatus}. Checking if should decrement...`);
      if (order.paymentStatus !== "paid") {
        console.log(`[VERIFY] Decrementing stock for order ${order.id}...`);
        const orderItems = await storage.getOrderItems(order.id);
        console.log(`[VERIFY] Order items:`, orderItems);
        const decrementItems = orderItems
          .filter((item) => item.productId)
          .map((item) => ({ productId: item.productId as string, quantity: item.quantity }));

        console.log(`[VERIFY] Items to decrement:`, decrementItems);
        if (decrementItems.length > 0) {
          try {
            await storage.decrementProductStocks(decrementItems);
            console.log(`[VERIFY] Stock decremented successfully`);
          } catch (stockError: any) {
            console.error(`[VERIFY] Stock decrement error:`, stockError);
            return res.status(400).json({ error: stockError?.message || "Insufficient stock to fulfill order" });
          }
        }
      } else {
        console.log(`[VERIFY] Order already paid, skipping stock decrement`);
      }

      const updatedOrder = await storage.updateOrder(order.id, {
        status: "paid",
        paymentStatus: "paid",
        paymentReference: reference,
      });

      await storage.clearCart(userId, req.sessionID);

      res.json({ success: true, order: updatedOrder });
    } catch (error) {
      console.error("Paystack verify failed:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.post("/api/paystack/webhook", async (req, res) => {
    try {
      if (!verifyPaystackWebhookSignature(req)) {
        return res.status(400).json({ error: "Invalid webhook signature" });
      }

      const event = req.body;
      if (event?.event === "charge.success" && event.data?.status === "success") {
        const reference = event.data.reference as string;
        const order = await storage.getOrderById(reference);
        if (order && order.paymentStatus !== "paid") {
          await storage.updateOrder(order.id, {
            status: "paid",
            paymentStatus: "paid",
            paymentReference: reference,
          });
        }
      }

      res.sendStatus(200);
    } catch (error) {
      console.error("Paystack webhook failed:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const userOrders = await storage.getOrders(userId);
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const order = await storage.getOrder(req.params.id, userId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const userId = getAuthenticatedUserId(req);
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const order = await storage.getOrder(req.params.id, userId);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getAdminStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id/items", requireAdmin, async (req, res) => {
    try {
      const items = await storage.getOrderItems(req.params.id);
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order items" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    try {
      const order = await storage.updateOrderStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to update order status" });
    }
  });

  app.get("/api/admin/shipping-rates", requireAdmin, async (req, res) => {
    try {
      const rates = await storage.getShippingRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipping rates" });
    }
  });

  app.post("/api/admin/shipping-rates", requireAdmin, async (req, res) => {
    const validation = insertShippingRateSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid shipping rate data", details: validation.error });
    }

    try {
      const rate = await storage.createShippingRate(validation.data);
      res.status(201).json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to create shipping rate" });
    }
  });

  app.patch("/api/admin/shipping-rates/:id", requireAdmin, async (req, res) => {
    const { fee } = req.body;
    if (typeof fee !== 'number' || fee < 0) {
      return res.status(400).json({ error: "Invalid shipping fee" });
    }

    try {
      const rate = await storage.updateShippingRate(req.params.id, { fee });
      if (!rate) {
        return res.status(404).json({ error: "Shipping rate not found" });
      }
      res.json(rate);
    } catch (error) {
      res.status(500).json({ error: "Failed to update shipping rate" });
    }
  });

  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    const validation = insertProductSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid product data", details: validation.error });
    }
    
    try {
      const product = await storage.createProduct(validation.data);
      // if an imageId was provided, attach the stored image path to the returned product
      if (validation.data.imageId) {
        try {
          const img = await storage.getImage(validation.data.imageId as string);
          if (img) (product as any).imageUrl = img.path;
        } catch (e) {
          console.error('Failed to lookup image for product create:', e);
        }
      }
      res.status(201).json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.put("/api/admin/products/:id", requireAdmin, async (req, res) => {
    const validation = insertProductSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid product data", details: validation.error });
    }
    
    try {
      const product = await storage.updateProduct(req.params.id, validation.data);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      if (validation.data.imageId) {
        try {
          const img = await storage.getImage(validation.data.imageId as string);
          if (img) (product as any).imageUrl = img.path;
        } catch (e) {
          console.error('Failed to lookup image for product update:', e);
        }
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteProduct(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/admin/collections", requireAdmin, async (req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch collections" });
    }
  });

  app.post("/api/admin/collections", requireAdmin, async (req, res) => {
    const validation = insertCollectionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid collection data", details: validation.error });
    }
    
    try {
      const collection = await storage.createCollection(validation.data);
      res.status(201).json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to create collection" });
    }
  });

  app.put("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    const validation = insertCollectionSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid collection data", details: validation.error });
    }
    
    try {
      const collection = await storage.updateCollection(req.params.id, validation.data);
      if (!collection) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      res.status(500).json({ error: "Failed to update collection" });
    }
  });

  app.delete("/api/admin/collections/:id", requireAdmin, async (req, res) => {
    try {
      const success = await storage.deleteCollection(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Collection not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete collection" });
    }
  });

  app.get("/api/admin/inquiries", requireAdmin, async (req, res) => {
    try {
      const inquiries = await storage.getInquiries();
      res.json(inquiries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  app.patch("/api/admin/inquiries/:id/status", requireAdmin, async (req, res) => {
    const { status } = req.body;
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    try {
      const inquiry = await storage.updateInquiryStatus(req.params.id, status);
      if (!inquiry) {
        return res.status(404).json({ error: "Inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      res.status(500).json({ error: "Failed to update inquiry status" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
