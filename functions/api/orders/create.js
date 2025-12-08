export async function onRequestPost({ request, env }) {
  const data = await request.json();

  // 1️⃣ VERIFY CAPTCHA
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

  // 2️⃣ PARSE ORDER INFO
  const { post_link, package: pkg, contact, note, price, user_note } = data;

  const fixedNote = JSON.stringify({
    ...note,
    user_note: user_note || ""
  });

  // 3️⃣ CREATE ORDER IN D1
  const public_token = crypto.randomUUID();
  const status = "pending_payment";
  const currency = "USDT";
  const pay_address = "0x8f5308c729c111555fdae285a8a899281e7d71af";
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
      fixedNote,
      price,
      currency,
      pay_address,
      status,
      public_token,
      created_at,
      updated_at
    )
    .run();

  const row = await env.DB.prepare("SELECT last_insert_rowid() AS id").first();
  const orderId = row.id;

  // 4️⃣ ⭐ SEND TO WORKER TO SAVE INTO KV ⭐
  await fetch("https://polished-glade-ad1fa1.humada.workers.dev", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify({
      type: "new_order",

      // GỬI ĐỦ THÔNG TIN CHO WORKER
      orderId,
      amount: price,
      contact,
      note: fixedNote,
      package: pkg,
      post_link
    })
  });

  // 5️⃣ RETURN ORDER TO FRONTEND
  return Response.json({
    order: {
      id: orderId,
      public_token,
      price
    }
  });
}
