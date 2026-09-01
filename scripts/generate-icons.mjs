import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const root = process.cwd();
const outputs = [
  ['apps/mobile/assets/icon.png', 1024, 'square'],
  ['apps/mobile/assets/adaptive-icon.png', 1024, 'foreground'],
  ['apps/mobile/android/app/src/main/res/mipmap-mdpi/app_icon.png', 48, 'square'],
  ['apps/mobile/android/app/src/main/res/mipmap-hdpi/app_icon.png', 72, 'square'],
  ['apps/mobile/android/app/src/main/res/mipmap-xhdpi/app_icon.png', 96, 'square'],
  ['apps/mobile/android/app/src/main/res/mipmap-xxhdpi/app_icon.png', 144, 'square'],
  ['apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/app_icon.png', 192, 'square'],
  ['apps/mobile/android/app/src/main/res/mipmap-mdpi/app_icon_round.png', 48, 'round'],
  ['apps/mobile/android/app/src/main/res/mipmap-hdpi/app_icon_round.png', 72, 'round'],
  ['apps/mobile/android/app/src/main/res/mipmap-xhdpi/app_icon_round.png', 96, 'round'],
  ['apps/mobile/android/app/src/main/res/mipmap-xxhdpi/app_icon_round.png', 144, 'round'],
  ['apps/mobile/android/app/src/main/res/mipmap-xxxhdpi/app_icon_round.png', 192, 'round'],
  ['apps/web/public/icons/icon-192.png', 192, 'square'],
  ['apps/web/public/icons/icon-512.png', 512, 'square'],
  ['apps/web/public/apple-touch-icon.png', 180, 'square'],
  ['apps/web/public/favicon.png', 64, 'square'],
];

const sourceSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" rx="224" fill="#090b18"/>
  <path d="M341 341h342M341 512h342M341 683h342M341 341v342M512 341v342M683 341v342" stroke="#293858" stroke-width="22" stroke-linecap="round"/>
  <path d="M312 312L712 712M712 312L312 712" stroke="#41f4d3" stroke-width="96" stroke-linecap="round"/>
  <circle cx="512" cy="512" r="178" fill="none" stroke="#ff4fd8" stroke-width="78"/>
  <circle cx="694" cy="332" r="44" fill="#ffd166"/>
</svg>
`;

fs.mkdirSync(path.join(root, 'apps/mobile/assets'), { recursive: true });
fs.mkdirSync(path.join(root, 'apps/web/public/icons'), { recursive: true });
fs.writeFileSync(path.join(root, 'apps/mobile/assets/app-icon-source.svg'), sourceSvg);

const colors = {
  base: [9, 11, 24],
  base2: [15, 21, 45],
  cyan: [65, 244, 211],
  magenta: [255, 79, 216],
  amber: [255, 209, 102],
  grid: [42, 57, 89],
  white: [245, 252, 255],
};

function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(max, v));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function roundedRectMask(x, y, size, radius) {
  const cx = Math.abs(x - size / 2) - (size / 2 - radius);
  const cy = Math.abs(y - size / 2) - (size / 2 - radius);
  const ox = Math.max(cx, 0);
  const oy = Math.max(cy, 0);
  const outside = Math.hypot(ox, oy) + Math.min(Math.max(cx, cy), 0) - radius;
  return 1 - smoothstep(-1.5, 1.5, outside);
}

function distToSegment(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const wx = px - ax;
  const wy = py - ay;
  const t = clamp((wx * vx + wy * vy) / (vx * vx + vy * vy));
  return Math.hypot(px - (ax + t * vx), py - (ay + t * vy));
}

function composite(pixel, color, alpha) {
  const a = clamp(alpha);
  pixel[0] = mix(pixel[0], color[0], a);
  pixel[1] = mix(pixel[1], color[1], a);
  pixel[2] = mix(pixel[2], color[2], a);
  pixel[3] = mix(pixel[3], 255, a);
}

function stroke(pixel, color, distance, width, alpha = 1) {
  const edge = 1 - smoothstep(width / 2 - 1.4, width / 2 + 1.4, distance);
  composite(pixel, color, edge * alpha);
}

function render(size, variant) {
  const data = Buffer.alloc(size * size * 4);
  const scale = size / 1024;
  const round = variant === 'round';
  const foreground = variant === 'foreground';

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const ux = (x + 0.5) / scale;
      const uy = (y + 0.5) / scale;
      const idx = (y * size + x) * 4;
      const pixel = [0, 0, 0, foreground ? 0 : 255];

      if (!foreground) {
        const vignette = clamp(Math.hypot(ux - 512, uy - 512) / 650);
        const topGlow = clamp(1 - Math.hypot(ux - 290, uy - 210) / 620);
        pixel[0] = mix(colors.base2[0], colors.base[0], vignette);
        pixel[1] = mix(colors.base2[1], colors.base[1], vignette);
        pixel[2] = mix(colors.base2[2], colors.base[2], vignette);
        composite(pixel, colors.cyan, topGlow * 0.08);
      }

      const gridLines = [
        [341, 341, 683, 341],
        [341, 512, 683, 512],
        [341, 683, 683, 683],
        [341, 341, 341, 683],
        [512, 341, 512, 683],
        [683, 341, 683, 683],
      ];

      for (const line of gridLines) {
        const d = distToSegment(ux, uy, ...line);
        stroke(pixel, colors.grid, d, 22, 0.7);
      }

      const xA = distToSegment(ux, uy, 312, 312, 712, 712);
      const xB = distToSegment(ux, uy, 712, 312, 312, 712);
      stroke(pixel, colors.cyan, Math.min(xA, xB), 150, 0.16);
      stroke(pixel, colors.cyan, Math.min(xA, xB), 96, 1);
      stroke(pixel, colors.white, Math.min(xA, xB), 28, 0.13);

      const ring = Math.abs(Math.hypot(ux - 512, uy - 512) - 178);
      stroke(pixel, colors.magenta, ring, 134, 0.15);
      stroke(pixel, colors.magenta, ring, 78, 0.98);
      stroke(pixel, colors.white, ring, 24, 0.12);

      const dot = Math.hypot(ux - 694, uy - 332);
      stroke(pixel, colors.amber, dot, 88, 0.95);
      stroke(pixel, colors.white, Math.hypot(ux - 680, uy - 318), 24, 0.42);

      const mask = round ? 1 - smoothstep(510, 514, Math.hypot(ux - 512, uy - 512)) : 1;
      data[idx] = Math.round(pixel[0]);
      data[idx + 1] = Math.round(pixel[1]);
      data[idx + 2] = Math.round(pixel[2]);
      data[idx + 3] = Math.round(pixel[3] * mask);
    }
  }

  return data;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, 'ascii');
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  typeBuffer.copy(out, 4);
  data.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 8 + data.length);
  return out;
}

function encodePng(width, height, rgba) {
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1);
    scanlines[row] = 0;
    rgba.copy(scanlines, row + 1, y * width * 4, (y + 1) * width * 4);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

for (const [relativePath, size, variant] of outputs) {
  const absolutePath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, encodePng(size, size, render(size, variant)));
  console.log(`${relativePath} ${size}x${size}`);
}
