const textEncoder = new TextEncoder();

export async function hmacSha256(secret, payload) {
  const subtle = globalThis.crypto && globalThis.crypto.subtle;
  if (!subtle) {
    throw new Error("Web Crypto API is not available in this environment.");
  }
  const key = await subtle.importKey("raw", textEncoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signatureBuffer = await subtle.sign("HMAC", key, textEncoder.encode(payload));
  return Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// export function hmacSha256(secret, payload) {
//   const hash = CryptoJS.HmacSHA256(payload, secret);
//   return CryptoJS.enc.Base64.stringify(hash);
// }

export function shuffleArray(array) {
  const arrayData = [...array]; // copy biar array asli nggak berubah
  for (let i = arrayData.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arrayData[i], arrayData[j]] = [arrayData[j], arrayData[i]];
  }
  return arrayData;
}
