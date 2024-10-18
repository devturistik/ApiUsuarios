// src/utils/idEncoder.js
export function encodeId(id) {
  return Buffer.from(id.toString()).toString("base64");
}

export function decodeId(encodedId) {
  const decoded = Buffer.from(encodedId, "base64").toString("ascii");
  const id = parseInt(decoded, 10);
  if (isNaN(id)) {
    throw new Error("ID inválido");
  }
  return id;
}
