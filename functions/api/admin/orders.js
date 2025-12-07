export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization");
  if (auth !== "Bearer ADMIN_SECRET_KEY") {
    return new Response("Unauthorized", { status: 403 });
  }

  const list = await env.DB.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC"
  ).all();

  return Response.json(list.results);
}

