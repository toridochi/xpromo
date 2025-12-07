export async function onRequestPost({ request, env }) {
  const body = await request.json();
  const { post_link, package: pkg, contact, note } = body;

  const price =
    pkg === "basic" ? 5 :
    pkg === "pro" ? 10 :
    pkg === "vip" ? 20 : 5;

  const token = crypto.randomUUID().replace(/-/g, "");
  const now = new Date().toISOString();

  const currency = "USDT";
  const pay_address = "YOUR_WALLET_ADDRESS";

  await env.DB
    .prepare(
      `INSERT INTO orders 
      (post_link, package, contact, note, price, currency, pay_address, status, public_token, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'created', ?, ?, ?)`
    )
    .bind(
      post_link, 
      pkg, 
      contact,
      note || "",
      price,
      currency,
      pay_address,
      token,
      now,
      now
    )
    .run();

  const result = await env.DB
    .prepare("SELECT last_insert_rowid() as id")
    .first();

  return Response.json({
    order_id: result.id,
    price,
    currency,
    pay_address,
    tracking_url: `/order.html?id=${result.id}&t=${token}`
  });
}

