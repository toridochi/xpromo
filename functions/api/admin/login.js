export async function onRequestPost({ request, env }) {
    const { password } = await request.json();
    if (!password) return new Response("Missing password", { status: 400 });

    if (password !== env.ADMIN_PASSWORD) {
        return new Response("Invalid password", { status: 401 });
    }

    // Generate HMAC token
    const timestamp = Date.now().toString();
    const raw = `admin:${timestamp}`;

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.ADMIN_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(raw)
    );

    const token = btoa(`${raw}:${bufferToHex(signature)}`);

    return Response.json({ token });
}

function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
