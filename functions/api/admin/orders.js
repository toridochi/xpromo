import { jwtVerify } from "jose";

export async function onRequestPost({ request, env }) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");

  try {
    await jwtVerify(token, new TextEncoder().encode(env.ADMIN_JWT_SECRET));
  } catch {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id, status } = await request.json();

  await env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?"
  ).bind(status, new Date().toISOString(), id).run();

  return Response.json({ ok: true });
}
