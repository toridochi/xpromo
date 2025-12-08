export async function onRequestPost({ request, env }) {
  const data = await request.json();

  const {
    post_link,
    package: pkg,
    contact,
    note,
    price,
    user_note    // frontend phải gửi user_note, nếu không gửi thì "".
  } = data;

  // --- FIX: đảm bảo user_note luôn nằm trong note object ---
  let fixedNote = note || {};
  fixedNote.user_note = user_note || fixedNote.user_note || "";

  const noteString = JSON.stringify(fixedNote);

  const public_token = crypto.randomUUID();
  const status = "pending_payment";
  const currency = "USDT";
  const pay_address = "0xef84aad573bc7c530cb397147ee12f773f9ea570";

  const created_at = new Date().toISOString();
  const updated_at = created_at;

  await env.DB.prepare(
      `INSERT INTO orders 
        (post_link, package, contact, note, price, currency, pay_address, status, public_token, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      post_link,
      pkg,
      contact,
      noteString,
      price,
      currency,
      pay_address,
      status,
      public_token,
      created_at,
      updated_at
    )
    .run();

  const row = await env.DB.prepare(
      "SELECT last_insert_rowid() AS id"
    )
    .first();

  return Response.json({
    order: {
      id: row.id,
      public_token,
      price
    }
  });
}
