export async function onRequestPost({ request, env }) {
  const data = await request.json();

  const {
    post_link,
    package: pkg,
    contact,
    note,
    price
  } = data;

  const public_token = crypto.randomUUID();
  const status = "pending_payment";
  const currency = "USDT";
  const pay_address = "0xef84aad573bc7c530cb397147ee12f773f9ea570";

  const created_at = new Date().toISOString();
  const updated_at = created_at;

  // 🔥 D1 Pages GIỐNG SQLITE: BẮT BUỘC phải RETURNING id
  const stmt = env.DB.prepare(`
    INSERT INTO orders
      (post_link, package, contact, note, price, currency, pay_address, status, public_token, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    RETURNING id;
  `).bind(
    post_link,
    pkg,
    contact,
    note,
    price,
    currency,
    pay_address,
    status,
    public_token,
    created_at,
    updated_at
  );

  const row = await stmt.first(); // Lấy dòng có id

  return Response.json({
    order: {
      id: row.id,            // ⭐ Luôn có ID
      public_token,
      price
    }
  });
}
