export async function verifyAdmin(request, env) {
    const auth = request.headers.get("Authorization");
    if (!auth) return null;

    if (!auth.startsWith("Bearer ")) return null;

    let token;
    try {
        token = atob(auth.replace("Bearer ", ""));
    } catch {
        return null;
    }

    const parts = token.split(":");
    if (parts.length !== 3) return null;

    const [user, ts, sig] = parts;

    if (user !== "admin") return null;

    const timestamp = Number(ts);
    if (!timestamp || isNaN(timestamp)) return null;

    // ❗ Token expires after 24 hours
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE) {
        return null;
    }

    const raw = `admin:${ts}`;

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
