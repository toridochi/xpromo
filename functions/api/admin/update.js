// /functions/api/admin/update.js
import { verifyAdmin } from "./verify";

export async function onRequestPost({ request, env }) {

    // 1. Check admin auth
    const admin = await verifyAdmin(request, env);
    if (!admin) return new Response("Unauthorized", { status: 403 });

    // 2. Read JSON body
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status)
        return new Response("Missing id or status", { status: 400 });

    // 3. Get order
    const order = await env.DB
        .prepare("SELECT * FROM orders WHERE id = ?")
        .bind(id)
        .first();

    if (!order) return new Response("Order not found", { status: 404 });

    // 4. Update order
    await env.DB.prepare(
        "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
    )
    .bind(status, new Date().toISOString(), id)
    .run();


    // ----------------------------------
    // 📧 SEND EMAIL (optional)
    // ----------------------------------
    try {
        const note = JSON.parse(order.note || "{}");
        const customerEmail = note.customer_email || order.contact;

        if (customerEmail) {
            let subject = "";
            let message = "";

            if (status === "confirmed" || status === "paid_waiting_confirmation") {
                subject = "Your Order Has Been Confirmed";
                message = `
Your order #${order.id} has been confirmed.
We received your payment.`;
            }

            if (status === "completed") {
                subject = "Your Order Is Completed";
                message = `
Your order #${order.id} has been completed.
Thank you for using our service!`;
            }

            if (subject) {
                await sendEmail(env, customerEmail, subject, message);
            }
        }
    } catch (err) {
        console.log("Email error:", err);
    }

    return Response.json({ success: true });
}


// ---------------------------------
// 📧 SEND EMAIL
// ---------------------------------
async function sendEmail(env, to, subject, text) {
    return await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${env.RESEND_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: env.EMAIL_FROM || "onboarding@resend.dev",
            to,
            subject,
            text
        })
    });
}
