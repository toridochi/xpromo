export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const t = url.searchParams.get("t");

  const order = await env.DB.prepare(
    "SELECT * FROM orders WHERE id = ? AND public_token = ?"
  ).bind(id, t).first();

  if (!order) return Response.json({ error: "Order not found" }, { status: 404 });

  return Response.json(order);
}
