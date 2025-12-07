import { SignJWT } from "jose";

export async function onRequestPost({ request, env }) {
  const { password } = await request.json();

  // PASSWORD THẬT LƯU TRONG ENV
  const realPassword = env.ADMIN_PASSWORD;

  if (!realPassword) {
    return Response.json({ error: "ADMIN_PASSWORD not set" }, { status: 500 });
  }

  if (password !== realPassword) {
    return Response.json({ error: "Invalid password" }, { status: 403 });
  }

  const secret = new TextEncoder().encode(env.JWT_SECRET);

  const token = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(secret);

  return Response.json({ token });
}
