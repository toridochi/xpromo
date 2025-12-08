// /functions/api/admin/orders.js
import { verifyAdmin } from "./verify";

export async function onRequestGet({ request, env }) {
    const admin = await verifyAdmin(request, env);
    if (!admin) return new Response("Unauthorized", { status: 403 });

    const rows = await env.DB.prepare(
        "SELECT * FROM orders ORDER BY created_at DESC LIMIT 300;"
    ).all();

    return Response.json(rows.results);
}
