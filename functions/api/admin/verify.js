export async function verifyAdmin(request, env) {
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) return null;

    let token; 
    try {
        token = atob(auth.slice(7)); // remove "Bearer "
    } catch {
        return null;
    }

    const parts = token.split(":");
    if (parts.length !== 3) return null;

    const [user, ts, sigHex] = parts;
    if (user !== "admin") return null;

    const timestamp = Number(ts);
    if (!timestamp || isNaN(timestamp)) return null;

    // Token expiry 24h
    const MAX_AGE = 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > MAX_AGE) return null;

    const raw = `admin:${ts}`;

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(env.ADMIN_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signatureBuf = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(raw)
    );

    // Convert the calculated signature to hex
    const checkHex = [...new Uint8Array(signatureBuf)]
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

    // Compare with signature from login.js
    if (sigHex !== checkHex) return null;

    return { user: "admin" };
}
