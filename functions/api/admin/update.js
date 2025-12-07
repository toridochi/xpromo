export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("Authorization");
  if (auth !== "Bearer Phamuyen@123.1") {
    return new Response("Unauthorized", { status: 403 });
  }

  const body = await request.json();
  const { order_id, status } = body;

  await env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
  ).bind(status, new Date().toISOString(), order_id).run();

  return Response.json({ message: "updated" });
}

