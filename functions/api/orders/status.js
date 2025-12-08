export async function onRequestGet({ request, env }) {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const token = url.searchParams.get("t");

    if (!id || !token) {
        return Response.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Lấy order trong DB
    const stmt = await env.DB.prepare(
        "SELECT * FROM orders WHERE id = ? AND public_token = ?"
    ).bind(id, token);

    const order = await stmt.first();

    if (!order) {
        return Response.json({ order: null });
    }

    return Response.json({ order });
}
