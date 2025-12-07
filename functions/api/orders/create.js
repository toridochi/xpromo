export async function onRequestPost({ request, env }) {
  const body = await request.json();

  const { post_link, package: pkg, contact, note, price } = body;

  const now = new Date().toISOString();
  const public_token = crypto.randomUUID();

  const result = await env.DB.prepare(
    `INSERT INTO orders (post_link, package, contact, note, price, currency, pay_address, status, public_token, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`
  ).bind(
    post_link,
    pkg,
    contact,
    note,
    price,
    "USDT",
    "YOUR_USDT_WALLET_ADDRESS",
    "pending_payment",
    public_token,
    now,
    now
  ).first();

  return Response.json({ ok: true, order: { id: result.id, public_token }});
}
