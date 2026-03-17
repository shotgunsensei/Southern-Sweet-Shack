import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: process.env.SMTP_USER && process.env.SMTP_PASS
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
});

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  specialInstructions?: string;
  items: { productName: string; quantity: number; unitPrice: string; lineTotal: string }[];
  subtotal: string;
  taxRate: string;
  taxAmount: string;
  total: string;
  createdAt: string;
}

function formatOrderHtml(order: OrderEmailData): string {
  const itemRows = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.productName}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.unitPrice}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${item.lineTotal}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #5C2E2E; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Burney's Sweets & More</h1>
        <p style="margin: 5px 0 0; font-size: 14px;">Order Confirmation</p>
      </div>
      
      <div style="padding: 20px;">
        <p>Order #${order.orderId} - ${new Date(order.createdAt).toLocaleString()}</p>
        
        <h3 style="color: #5C2E2E;">Customer Details</h3>
        <p><strong>Name:</strong> ${order.customerName}</p>
        <p><strong>Email:</strong> ${order.customerEmail}</p>
        ${order.customerPhone ? `<p><strong>Phone:</strong> ${order.customerPhone}</p>` : ""}
        ${order.specialInstructions ? `<p><strong>Special Instructions:</strong> ${order.specialInstructions}</p>` : ""}
        
        <h3 style="color: #5C2E2E;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f0eb;">
              <th style="padding: 8px; text-align: left;">Item</th>
              <th style="padding: 8px; text-align: center;">Qty</th>
              <th style="padding: 8px; text-align: right;">Price</th>
              <th style="padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>
        
        <div style="margin-top: 20px; text-align: right;">
          <p><strong>Subtotal:</strong> $${order.subtotal}</p>
          <p><strong>NC Sales Tax (${(parseFloat(order.taxRate) * 100).toFixed(2)}%):</strong> $${order.taxAmount}</p>
          <p style="font-size: 18px; color: #5C2E2E;"><strong>Total: $${order.total}</strong></p>
        </div>
      </div>
      
      <div style="background-color: #f5f0eb; padding: 15px; text-align: center; font-size: 12px; color: #666;">
        <p>Burney's Sweets & More - Clinton, NC</p>
        <p>Thank you for your order!</p>
      </div>
    </div>
  `;
}

export async function sendOrderConfirmation(order: OrderEmailData): Promise<void> {
  const html = formatOrderHtml(order);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "orders@burneyssweetsandmore.com",
      to: order.customerEmail,
      subject: `Order Confirmation #${order.orderId} - Burney's Sweets & More`,
      html,
    });
  } catch (err) {
    console.error("Failed to send customer email:", err);
  }
}

export async function sendOrderNotification(order: OrderEmailData): Promise<void> {
  const html = formatOrderHtml(order);

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "orders@burneyssweetsandmore.com",
      to: "john@shotgunninjas.com",
      subject: `New Order #${order.orderId} from ${order.customerName}`,
      html,
    });
  } catch (err) {
    console.error("Failed to send notification email:", err);
  }
}
