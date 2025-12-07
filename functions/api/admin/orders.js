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

export async function onRequestGet({ request, env }) {
  // AUTH
  const authorized = await checkAdmin(request, env);
  if (!authorized) {
    return new Response("Unauthorized", { status: 403 });
  }

  // GET ALL ORDERS
  const list = await env.DB.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC"
  ).all();

  return Response.json(list.results);
}
