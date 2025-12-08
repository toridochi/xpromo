export async function onRequestPost({ request, env }) {
  const data = await request.json();

  // 1️⃣ CHECK CAPTCHA
  const captchaToken = data.turnstile;
  if (!captchaToken) {
    return Response.json({ error: "Missing captcha" }, { status: 400 });
  }

  const verifyRes = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET,
        response: captchaToken
      }),
    }
  );

  const verifyJson = await verifyRes.json();
  if (!verifyJson.success) {
    return Response.json({ error: "Captcha failed" }, { status: 400 });
  }

  // 2️⃣ GET DATA
  const {
    post_link,
    package: pkg,
    contact,
    note,
    price,
    user_note,
  } = data;

  let fixedNote = note || {};
  fixedNote.user_note = user_note || fixedNote.user_note || "";
  const noteString = JSON.stringify(fixedNote);

  // 3️⃣ CREATE ORDER
  const public_token = crypto.randomUUID();
  const status = "pending_payment";
  const currency = "USDT";
  const pay_address = "0xef84aad573bc7c530cb397147ee12f773f9ea570";
  const created_at = new Date().toISOString();
  const updated_at = created_at;

  // 4️⃣ SAVE TO D1
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
  ).first();

  const orderId = row.id;

  // 5️⃣ ⭐ GỬI LÊN WORKER ĐỂ LƯU VÀO KV ⭐
  await fetch("https://polished-glade-ad1fa1.humada.workers.dev", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "new_order",
      orderId,
      amount: price
    })
  });

  // 6️⃣ RETURN TO FRONTEND
  return Response.json({
    order: {
      id: orderId,
      public_token,
      price,
    },
  });
}
