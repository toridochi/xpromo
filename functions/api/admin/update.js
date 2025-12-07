export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("Authorization");
  const realKey = env.ADMIN_SECRET_KEY;

  if (auth !== `Bearer ${realKey}`) {
    return new Response("Unauthorized", { status: 403 });
  }

  const { id, status } = await request.json();

  await env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
  ).bind(status, id)
  .run();

  return Response.json({ success: true });
}
