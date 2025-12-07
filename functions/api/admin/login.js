import { SignJWT } from "jose";

export async function onRequestPost({ request, env }) {
  const { key } = await request.json();
  const correct = env.ADMIN_JWT_SECRET;

  if (key !== correct) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const jwt = await new SignJWT({ admin: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("6h")
    .sign(new TextEncoder().encode(correct));

  return Response.json({ token: jwt });
}
