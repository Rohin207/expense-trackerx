export const encodeBase64 = (value = "") =>
  Buffer.from(String(value), "utf8").toString("base64");

