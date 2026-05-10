import { Resend } from "resend";


const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://computerservice.ng";

function normalizePhone(raw: string): string {
  let phone = raw.replace(/\D/g, "");
  if (phone.startsWith("0")) phone = "234" + phone.slice(1);
  if (!phone.startsWith("234")) phone = "234" + phone;
  return "+" + phone;
}

async function sendSms(to: string, message: string): Promise<void> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) { console.log(`[DEV] SMS → ${to}: ${message}`); return; }

  const phone    = normalizePhone(to);
  const senderId = process.env.TERMII_SENDER_ID || "N-Alert";

  const payload = (channel: string) => JSON.stringify({
    to: phone, from: senderId, sms: message,
    type: "plain", api_key: apiKey, channel,
  });

  try {
    let res = await fetch("https://api.ng.termii.com/api/sms/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: payload("generic"),
    });
    if (!res.ok) {
      console.error("Termii generic failed:", await res.text().catch(() => ""));
      // Fallback to dnd channel
      res = await fetch("https://api.ng.termii.com/api/sms/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: payload("dnd"),
      });
      if (!res.ok) console.error("Termii dnd also failed:", await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("sendSms error:", err);
  }
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log(`[DEV] Email → ${to}: ${subject}`); return; }
  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "ComputerService.ng <noreply@computerservice.ng>",
      to, subject, html,
    });
    if (error) console.error("Resend error:", error);
  } catch (err) {
    console.error("sendEmail error:", err);
  }
}


export interface OrderNotification {
  orderId:      string;
  customerName: string;
  phoneNumber:  string;
  email?:       string | null;
  service:      string;
  amount:       number | string;
}


export async function notifyAdminNewOrder(order: OrderNotification): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminEmail && !adminPhone) return;

  const amount       = Number(order.amount);
  const dashboardUrl = `${BASE_URL}/admin/dashboard`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:32px 24px;background:#f8f9fc;border-radius:12px;">
      <h2 style="color:#5123d4;margin:0 0 6px;">📦 New Order Received</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">A new order was placed on ComputerService.ng</p>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;width:130px;">Order ID</td><td style="padding:10px 0;font-weight:700;color:#5123d4;">${order.orderId}</td></tr>
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;">Customer</td><td style="padding:10px 0;font-weight:600;">${order.customerName}</td></tr>
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;">Phone</td><td style="padding:10px 0;">${order.phoneNumber}</td></tr>
          ${order.email ? `<tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;">Email</td><td style="padding:10px 0;">${order.email}</td></tr>` : ""}
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;">Service</td><td style="padding:10px 0;">${order.service}</td></tr>
          <tr><td style="padding:10px 0;color:#6b7280;font-size:12px;text-transform:uppercase;">Amount</td><td style="padding:10px 0;font-weight:700;font-size:16px;">₦${amount.toLocaleString()}</td></tr>
        </table>
      </div>
      <a href="${dashboardUrl}" style="display:inline-block;background:#5123d4;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">View in Dashboard →</a>
      <p style="color:#9ca3af;font-size:11px;margin-top:20px;">ComputerService.ng automated notification</p>
    </div>`;

  const sms = `ComputerService.ng: New order ${order.orderId} from ${order.customerName} for ${order.service}. Amount: ₦${amount.toLocaleString()}. Login to dashboard to process.`;

  await Promise.allSettled([
    adminEmail ? sendEmail(adminEmail, `New Order: ${order.orderId} — ${order.customerName}`, html) : Promise.resolve(),
    adminPhone ? sendSms(adminPhone, sms) : Promise.resolve(),
  ]);
}


export async function notifyCustomerOrderConfirmed(order: OrderNotification): Promise<void> {
  if (!order.phoneNumber && !order.email) return;

  const amount      = Number(order.amount);
  const trackingUrl = `${BASE_URL}/order/tracking?orderId=${encodeURIComponent(order.orderId)}`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:580px;margin:auto;padding:32px 24px;background:#f8f9fc;border-radius:12px;">
      <h2 style="color:#5123d4;margin:0 0 6px;">✅ Payment Confirmed!</h2>
      <p style="color:#6b7280;margin:0 0 24px;font-size:14px;">Your order is now in progress. Save your Order ID to track it anytime.</p>
      <div style="background:#fff;border:2px solid #5123d4;border-radius:12px;padding:24px;margin-bottom:20px;text-align:center;">
        <p style="color:#6b7280;font-size:12px;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;">Your Order ID</p>
        <p style="font-size:30px;font-weight:800;color:#5123d4;letter-spacing:.05em;margin:0 0 4px;">${order.orderId}</p>
        <p style="color:#6b7280;font-size:12px;margin:0;">Use this to track your order at any time</p>
      </div>
      <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;width:130px;">Customer</td><td style="padding:8px 0;font-weight:600;">${order.customerName}</td></tr>
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Service</td><td style="padding:8px 0;">${order.service}</td></tr>
          <tr style="border-bottom:1px solid #f3f4f6;"><td style="padding:8px 0;color:#6b7280;">Amount Paid</td><td style="padding:8px 0;font-weight:700;">₦${amount.toLocaleString()}</td></tr>
          <tr><td style="padding:8px 0;color:#6b7280;">Status</td><td style="padding:8px 0;color:#2563eb;font-weight:600;">In Progress</td></tr>
        </table>
      </div>
      <a href="${trackingUrl}" style="display:inline-block;background:#5123d4;color:#fff;padding:12px 28px;border-radius:8px;font-weight:700;text-decoration:none;font-size:14px;">Track Your Order →</a>
      <p style="color:#9ca3af;font-size:11px;margin-top:20px;">ComputerService.ng — Quality services delivered to you.</p>
    </div>`;

  const sms = `ComputerService.ng: Payment confirmed! Order ID: ${order.orderId}. Track your order at: ${trackingUrl}`;

  await Promise.allSettled([
    order.email     ? sendEmail(order.email, `Order Confirmed: ${order.orderId}`, html) : Promise.resolve(),
    order.phoneNumber ? sendSms(order.phoneNumber, sms) : Promise.resolve(),
  ]);
}
