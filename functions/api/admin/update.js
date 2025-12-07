import { verifyAdmin } from "./verify";

export async function onRequestPost({ request, env }) {
    const admin = await verifyAdmin(request, env);
    if (!admin) return new Response("Unauthorized", { status: 403 });

    const { id, status } = await request.json();

    await env.DB.prepare(
        "UPDATE orders SET status = ? WHERE id = ?"
    ).bind(status, id).run();

    return Response.json({ ok: true });
}
