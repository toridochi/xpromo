export async function verifyAdmin(request, env) {
    const auth = request.headers.get("Authorization");
    if (!auth) return null;

    if (!auth.startsWith("Bearer ")) return null;

    const token = atob(auth.replace("Bearer ", ""));

    const parts = token.split(":");
    if (parts.length !== 3) return null;

    const [user, timestamp, sig] = parts;

    if (user !== "admin") return null;

    const raw = `admin:${timestamp}`;
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.ADMIN_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const checkSig = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(raw)
    );

    if (sig !== bufferToHex(checkSig)) {
        return null;
    }

    return { user: "admin" };
}

function bufferToHex(buffer) {
    return [...new Uint8Array(buffer)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}
