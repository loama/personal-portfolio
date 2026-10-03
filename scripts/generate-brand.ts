import { writeFile } from "node:fs/promises";
import sharp from "sharp";

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#20241f"/><text x="15" y="45" font-family="Arial,sans-serif" font-size="46" font-weight="600" fill="#f8f9f4">e</text><circle cx="47" cy="44" r="4" fill="#bdcba6"/></svg>`;
await writeFile("public/icon.svg", icon);
const png = await sharp(Buffer.from(icon)).resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 64;
header[7] = 64;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await writeFile("public/favicon.ico", Buffer.concat([header, png]));
await sharp(Buffer.from(icon)).resize(180, 180).png().toFile("public/apple-touch-icon.png");

const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#f8f9f4"/><g font-family="Arial,sans-serif"><text x="64" y="92" font-size="22" font-weight="700" fill="#20241f">eduardo.</text><text x="64" y="247" font-size="64" font-weight="600" letter-spacing="-3" fill="#20241f">I build software.</text><text x="64" y="319" font-size="62" font-weight="600" letter-spacing="-3" fill="#536343">And the companies</text><text x="64" y="391" font-size="62" font-weight="600" letter-spacing="-3" fill="#536343">behind it.</text><text x="66" y="468" font-size="22" fill="#5e6458">Eduardo López · Founder and software engineer</text><text x="66" y="564" font-size="18" fill="#536343">Supervisor · Constructor · Amiloz, YC W22</text></g><rect x="784" y="56" width="362" height="518" rx="34" fill="#e6eadc"/></svg>`;
const mask = Buffer.from(`<svg width="346" height="502"><rect width="346" height="502" rx="26" fill="white"/></svg>`);
const portrait = await sharp("public/images/eduardo.webp").resize(346, 502, { fit: "cover" }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
await sharp(Buffer.from(canvas)).composite([{ input: portrait, left: 792, top: 64 }]).png().toFile("public/og.png");
