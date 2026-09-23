// Generador UUIDv7 — mismo layout que Uuid7.java del backend
// 48-bit timestamp + 4-bit versión (0x7) + 12-bit counter monótono + 62-bit random

let lastMs = -1;
let counter = 0;
const random = new Uint8Array(8);

function cryptoRandom(): bigint {
  crypto.getRandomValues(random);
  let value = 0n;
  for (let i = 0; i < 8; i++) {
    value = (value << 8n) | BigInt(random[i]);
  }
  return value;
}

export function uuidV7(): string {
  const now = Date.now();

  if (now > lastMs) {
    lastMs = now;
    counter = Number(cryptoRandom() & 0x7FFn);
  } else {
    counter++;
    if (counter > 0xFFF) {
      lastMs++;
      counter = 0;
    }
  }

  const upper = (BigInt(now) << 16n) | 0x7000n | BigInt(counter);
  const lower = (cryptoRandom() & 0x3FFFFFFFFFFFFFFFn) | 0x8000000000000000n;

  const hex = (upper << 64n | lower).toString(16).padStart(32, '0');
  return (
    hex.slice(0, 8) + '-' +
    hex.slice(8, 12) + '-' +
    hex.slice(12, 16) + '-' +
    hex.slice(16, 20) + '-' +
    hex.slice(20, 32)
  );
}