export async function onRequestPost({ request, env }) {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
        return new Response("Unauthorized", { status: 403 });
    }

    // 🔐 Verify admin token
    const token = auth.split(" ")[1];
    const verify = await env.ADMIN_VERIFY(token);
    if (!verify) {
        return new Response("Invalid token", { status: 403 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !status)
        return new Response("Missing id or status", { status: 400 });

    // Lấy order để lấy email khách
    const order = await env.DB.prepare(
        "SELECT * FROM orders WHERE id = ?"
    ).bind(id).first();

    if (!order) {
        return new Response("Order not found", { status: 404 });
    }

    // Cập nhật status
    await env.DB.prepare(
        "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
    )
    .bind(status, new Date().toISOString(), id)
    .run();


    // -------------------------------
    // 📧 SEND EMAIL TO CUSTOMER
    // -------------------------------
    try {
        const note = JSON.parse(order.note);
        const customerEmail = note.email || order.contact;

        if (customerEmail) {
            let subject = "";
            let message = "";

            if (status === "confirmed" || status === "paid_waiting_confirmation") {
                subject = "Your Order Has Been Confirmed";
                message = `
                    Hi, your order #${order.id} has been confirmed.
                    We have received your payment.
                `;
            }

            if (status === "completed") {
                subject = "Your Order Is Completed";
                message = `
                    Hi, your order #${order.id} has been completed.
                    Thank you for using our service!
                `;
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


// ---------------------------------------
// 📧 RESEND EMAIL FUNCTION
// ---------------------------------------
async function sendEmail(env, to, subject, text) {
    const apiKey = env.RESEND_API_KEY;

    return await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
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
