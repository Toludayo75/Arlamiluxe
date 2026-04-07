import type { Request } from "express";
import crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY?.trim();
const PAYSTACK_BASE_URL = process.env.PAYSTACK_BASE_URL?.replace(/\/$/, "") ?? "https://api.paystack.co";

if (!PAYSTACK_SECRET_KEY) {
  console.warn("PAYSTACK_SECRET_KEY is not configured. Paystack API requests will fail.");
}

export interface PaystackInitializeOptions {
  amount: number;
  email: string;
  reference: string;
  callbackUrl: string;
}

function getPaystackHeaders() {
  if (!PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY is missing from environment");
  }

  return {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function initializePaystackTransaction(options: PaystackInitializeOptions) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: getPaystackHeaders(),
    body: JSON.stringify({
      email: options.email,
      amount: options.amount,
      reference: options.reference,
      callback_url: options.callbackUrl,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Paystack initialize response error:", response.status, data);
  }
  return data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: getPaystackHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    console.error("Paystack verify response error:", response.status, data);
  }
  return data;
}

export function verifyPaystackWebhookSignature(req: Request) {
  const signatureHeader = req.headers["x-paystack-signature"];
  const signature = Array.isArray(signatureHeader) ? signatureHeader[0] : signatureHeader;
  if (!signature || !req.rawBody || !PAYSTACK_SECRET_KEY) {
    return false;
  }

  const payload = Buffer.isBuffer(req.rawBody)
    ? req.rawBody
    : Buffer.from(String(req.rawBody), "utf8");

  const expectedSignature = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(payload)
    .digest("hex");

  return expectedSignature === signature;
}
