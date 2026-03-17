import { Router, type IRouter } from "express";
import { eq, inArray } from "drizzle-orm";
import { db, productsTable, ordersTable, orderItemsTable } from "@workspace/db";
import { CreateOrderBody } from "@workspace/api-zod";
import { sendOrderConfirmation, sendOrderNotification } from "../lib/email";

const NC_TAX_RATE = 0.0675;

const router: IRouter = Router();

router.post("/orders", async (req, res): Promise<void> => {
  const parsed = CreateOrderBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { customerName, customerEmail, customerPhone, specialInstructions, items } = parsed.data;

  if (!items || items.length === 0) {
    res.status(400).json({ error: "Order must contain at least one item" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(customerEmail)) {
    res.status(400).json({ error: "Invalid email address" });
    return;
  }

  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1) {
      res.status(400).json({ error: "Each item must have a positive integer quantity" });
      return;
    }
  }

  const productIds = items.map((i) => i.productId);
  const products = await db
    .select()
    .from(productsTable)
    .where(inArray(productsTable.id, productIds));

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      res.status(400).json({ error: `Product with id ${item.productId} not found` });
      return;
    }
    if (!product.available) {
      res.status(400).json({ error: `Product "${product.name}" is not currently available` });
      return;
    }
  }

  let subtotal = 0;
  const orderItemsData = items.map((item) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = parseFloat(product.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;
    return {
      productId: item.productId,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: unitPrice.toFixed(2),
      lineTotal: lineTotal.toFixed(2),
    };
  });

  const taxAmount = subtotal * NC_TAX_RATE;
  const total = subtotal + taxAmount;

  const [order] = await db
    .insert(ordersTable)
    .values({
      customerName,
      customerEmail,
      customerPhone: customerPhone || "",
      specialInstructions: specialInstructions || "",
      subtotal: subtotal.toFixed(2),
      taxRate: NC_TAX_RATE.toFixed(4),
      taxAmount: taxAmount.toFixed(2),
      total: total.toFixed(2),
      status: "pending",
    })
    .returning();

  await db.insert(orderItemsTable).values(
    orderItemsData.map((item) => ({
      orderId: order.id,
      ...item,
    }))
  );

  const orderEmail = {
    orderId: order.id,
    customerName,
    customerEmail,
    customerPhone: customerPhone || undefined,
    specialInstructions: specialInstructions || undefined,
    items: orderItemsData,
    subtotal: subtotal.toFixed(2),
    taxRate: NC_TAX_RATE.toFixed(4),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
    createdAt: order.createdAt.toISOString(),
  };

  sendOrderConfirmation(orderEmail).catch(console.error);
  sendOrderNotification(orderEmail).catch(console.error);

  res.status(201).json({
    id: order.id,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    subtotal: subtotal.toFixed(2),
    taxRate: NC_TAX_RATE.toFixed(4),
    taxAmount: taxAmount.toFixed(2),
    total: total.toFixed(2),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: orderItemsData,
  });
});

export default router;
