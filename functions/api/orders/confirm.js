export async function onRequestPost({ request, env }) {
    try {
        const { id, public_token } = await request.json();

        if (!id || !public_token) {
            return Response.json({ error: "Missing id or token" }, { status: 400 });
        }

        // Cập nhật trạng thái đơn hàng thành "paid_waiting_confirmation"
        await env.DB.prepare(
            `UPDATE orders 
             SET status = ?, updated_at = datetime('now') 
             WHERE id = ? AND public_token = ?`
        )
        .bind("paid_waiting_confirmation", id, public_token)
        .run();

        // Trả response về client
        return Response.json({
            ok: true,
            order: {
                id,
                public_token
            }
        });

    } catch (err) {
        return Response.json({ error: err.message }, { status: 500 });
    }
}
