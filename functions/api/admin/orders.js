import { jwtVerify } from "jose";

export async function onRequestGet({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");

  try {
    await jwtVerify(token, new TextEncoder().encode(env.ADMIN_JWT_SECRET));
  } catch (e) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const list = await env.DB.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC"
  ).all();

  return Response.json(list.results);
}
