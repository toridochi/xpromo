import { jwtVerify } from "jose";

// Kiểm tra JWT token admin
async function checkAdmin(request, env) {
  const auth = request.headers.get("Authorization");
  if (!auth || !auth.startsWith("Bearer ")) return false;

  const token = auth.replace("Bearer ", "");
  try {
    await jwtVerify(token, new TextEncoder().encode(env.JWT_SECRET));
    return true;
  } catch (e) {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  // AUTH
  const authorized = await checkAdmin(request, env);
  if (!authorized) {
    return new Response("Unauthorized", { status: 403 });
  }

  // PARSE BODY
  const { id, status } = await request.json();

  if (!id || !status) {
    return Response.json({ error: "Missing parameters" }, { status: 400 });
  }

  // UPDATE STATUS
  await env.DB.prepare(
    "UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ?"
  )
    .bind(status, id)
    .run();

  return Response.json({ success: true });
}
