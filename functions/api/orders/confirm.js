export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const { order_id, public_token } = body;

  const order = await env.DB.prepare(
    "SELECT * FROM orders WHERE id = ? AND public_token = ?"
  ).bind(order_id, public_token).first();

  if (!order) return new Response("Invalid token", { status: 403 });

  await env.DB.prepare(
    "UPDATE orders SET status = 'waiting_admin_verify', updated_at = ? WHERE id = ?"
  ).bind(new Date().toISOString(), order_id).run();

  return Response.json({ message: "ok" });
}

