export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("t");

  const order = await env.DB.prepare(
    "SELECT * FROM orders WHERE id = ? AND public_token = ?"
  ).bind(id, token).first();

  if (!order) return new Response("Invalid token", { status: 403 });

  return Response.json(order);
}

