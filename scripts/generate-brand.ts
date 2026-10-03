import { readFile, writeFile } from "node:fs/promises";
import fontkit from "@pdf-lib/fontkit";
import sharp from "sharp";

const font = fontkit.create(await readFile("public/fonts/Sk-Modernist-Bold.otf"));
function lettering(value: string, x: number, y: number, size: number, color: string) {
  const run = font.layout(value);
  let advance = 0;
  const paths = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const path = `<path transform="translate(${advance + position.xOffset},${position.yOffset})" d="${glyph.path.toSVG()}"/>`;
    advance += position.xAdvance;
    return path;
  }).join("");
  return `<g fill="${color}" transform="translate(${x},${y}) scale(${size / font.unitsPerEm},${-size / font.unitsPerEm})">${paths}</g>`;
}

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#ff5125"/>${lettering("e", 14, 45, 48, "#000000")}<circle cx="48" cy="43" r="4" fill="#000000"/></svg>`;
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

const canvas = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#ffffff"/>${lettering("eduardo.", 64, 92, 26, "#000000")}${lettering("I build software.", 64, 247, 64, "#000000")}${lettering("And the companies", 64, 319, 62, "#ff5125")}${lettering("behind it.", 64, 391, 62, "#ff5125")}<g font-family="Arial,sans-serif"><text x="66" y="468" font-size="22" fill="#666666">Eduardo López · Founder and software engineer</text><text x="66" y="538" font-size="18" fill="#b63312">Supervisor · Constructor · Amiloz, YC W22</text><text x="66" y="570" font-size="18" fill="#666666">Platanus Ventures 2023</text></g><rect x="784" y="56" width="362" height="518" rx="34" fill="#ff5125"/></svg>`;
const mask = Buffer.from(`<svg width="346" height="502"><rect width="346" height="502" rx="26" fill="white"/></svg>`);
const portrait = await sharp("public/images/eduardo-linkedin.webp").resize(346, 502, { fit: "cover" }).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
await sharp(Buffer.from(canvas)).composite([{ input: portrait, left: 792, top: 64 }]).png().toFile("public/og.png");
