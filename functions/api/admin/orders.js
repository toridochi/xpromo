export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization");

  // Lấy key thật từ Cloudflare Environment
  const realKey = env.ADMIN_SECRET_KEY;

  if (auth !== `Bearer ${realKey}`) {
    return new Response("Unauthorized", { status: 403 });
  }

  const list = await env.DB.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC"
  ).all();

  return Response.json(list.results);
}
