export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();

        const {
            post_link,
            contact,
            note,
            price,
        } = body;

        if (!contact || !note || !price) {
            return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
        }

        const public_token = crypto.randomUUID();
        const created_at = new Date().toISOString();
        const updated_at = created_at;

        const stmt = `
            INSERT INTO orders
            (post_link, package, contact, note, price, currency, pay_address, status, public_token, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const params = [
            post_link,
            body.package || "multi",
            contact,
            note,
            price,
            "USDT",
            "0xef84aad573bc7c530cb397147ee12f773f9ea570",
            "pending_payment",
            public_token,
            created_at,
            updated_at,
        ];

        const result = await env.DB.prepare(stmt).bind(...params).run();

        return Response.json({
            success: true,
            order: {
                id: result.meta.last_row_id,
                public_token
            }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.toString() }), { status: 500 });
    }
}
