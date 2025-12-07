export async function onRequestPost({ request, env }) {
  const { id, token } = await request.json();

  const order = await env.DB.prepare(
    "SELECT * FROM orders WHERE id = ? AND public_token = ?"
  ).bind(id, token).first();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  await env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
  ).bind("paid_waiting_approval", new Date().toISOString(), id).run();

  return Response.json({ ok: true });
}
