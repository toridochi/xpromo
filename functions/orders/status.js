export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("t");

    if (!id || !token) {
      return Response.json({ success: false, error: "Missing parameters" });
    }

    const row = await env.DB
      .prepare("SELECT * FROM orders WHERE id = ? AND public_token = ?")
      .bind(id, token)
      .first();

    if (!row) {
      return Response.json({ success: false, error: "Order not found" });
    }

    return Response.json({
      success: true,
      order: {
        id: row.id,
        contact: row.contact,
        status: row.status,
        price: row.price,
        note: row.note,  // JSON string
        created_at: row.created_at
      }
    });

  } catch (err) {
    return Response.json({ success: false, error: err.toString() });
  }
}
