export async function onRequestPost({ request, env }) {
  const { password } = await request.json();
  const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

  if (password !== ADMIN_PASSWORD) {
    return Response.json({ ok: false, error: "Wrong password" }, { status: 403 });
  }

  const token = crypto.randomUUID();
  await env.SESSIONS.put(token, "admin", { expirationTtl: 60 * 60 * 6 });

  return Response.json({ ok: true, token });
}
