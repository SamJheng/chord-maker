import type { ChordDefinition } from 'shared';

interface Props {
  definition: ChordDefinition;
  className?: string;
}

// ── 圖形常數 ──────────────────────────────────────────────────────
const STRINGS = 6;
const FRETS = 4;
const W = 108;        // SVG 總寬
const H = 138;        // SVG 總高
const ML = 22;        // 左邊距（留給品格號碼）
const MT = 36;        // 上邊距（留給和弦名稱 + 空弦標記）
const SS = 14;        // 弦間距 (string spacing)
const FS = 16;        // 品間距 (fret spacing)
const DR = 6;         // 按點半徑 (dot radius)
const GRID_W = (STRINGS - 1) * SS;
const GRID_H = FRETS * FS;

// ── 主元件 ───────────────────────────────────────────────────────
export function ChordDiagram({ definition, className }: Props) {
  return (
    <div
      className={className}
      title={definition.name}
      dangerouslySetInnerHTML={{ __html: buildSvg(definition) }}
    />
  );
}

// ── SVG 產生器 ────────────────────────────────────────────────────
function buildSvg(def: ChordDefinition): string {
  const { name, baseFret, frets, fingers = [] } = def;
  const hasNut = baseFret === 1;
  const gridTop = MT + (hasNut ? 4 : 0); // nut 佔 4px
  const parts: string[] = [];

  // 和弦名稱
  parts.push(text(W / 2, 13, name, 'middle', 13, true, '#ffffff'));

  // 空弦 / 悶音標記（在格架正上方）
  frets.forEach((fret, i) => {
    const x = ML + i * SS;
    if (fret === 'x') {
      parts.push(text(x, MT - 5, '✕', 'middle', 10, false, '#ffffff'));
    } else if (fret === 0) {
      parts.push(`<circle cx="${x}" cy="${MT - 9}" r="4" fill="none" stroke="#ffffff" stroke-width="1.2"/>`);
    }
  });

  // 琴枕（baseFret=1 時）
  if (hasNut) {
    parts.push(`<rect x="${ML}" y="${MT}" width="${GRID_W}" height="4" rx="1" fill="rgba(255,255,255,0.9)"/>`);
  } else {
    // 品格位置文字
    parts.push(text(ML - 4, gridTop + FS * 0.5 + 4, `${baseFret}fr`, 'end', 9, false, '#ffffff'));
  }

  // 品格橫線
  for (let f = 0; f <= FRETS; f++) {
    const y = gridTop + f * FS;
    parts.push(`<line x1="${ML}" y1="${y}" x2="${ML + GRID_W}" y2="${y}" stroke="rgba(255,255,255,0.3)" stroke-width="${f === 0 && !hasNut ? 1.5 : 1}"/>`);
  }

  // 弦（縱線）
  for (let s = 0; s < STRINGS; s++) {
    const x = ML + s * SS;
    parts.push(`<line x1="${x}" y1="${gridTop}" x2="${x}" y2="${gridTop + GRID_H}" stroke="rgba(255,255,255,0.5)" stroke-width="1.2"/>`);
  }

  // 偵測橫按 (barre)
  const barre = detectBarre(frets, fingers);

  // 橫按弧線
  if (barre) {
    const { finger, fret, from, to } = barre;
    const x1 = ML + (from - 1) * SS - DR;
    const x2 = ML + (to - 1) * SS + DR;
    const cy = gridTop + (fret - 0.5) * FS;
    parts.push(`<rect x="${x1}" y="${cy - DR}" width="${x2 - x1}" height="${DR * 2}" rx="${DR}" fill="#222"/>`);
    parts.push(text((x1 + x2) / 2, cy + 4, String(finger), 'middle', 8, false, 'white'));
  }

  // 按點（一般音符）
  frets.forEach((fret, i) => {
    if (fret === 'x' || fret === 0) return;
    const finger = fingers[i] ?? 0;
    // 屬於橫按的按點不重複畫
    if (barre && barre.finger === finger && barre.fret === fret && i + 1 >= barre.from && i + 1 <= barre.to) return;
    const cx = ML + i * SS;
    const cy = gridTop + (fret - 0.5) * FS;
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${DR}" fill="#222"/>`);
    if (finger > 0) {
      parts.push(text(cx, cy + 4, String(finger), 'middle', 8, false, 'white'));
    }
  });

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">${parts.join('')}</svg>`;
}

// ── 橫按偵測 ─────────────────────────────────────────────────────
function detectBarre(
  frets: (number | 'x')[],
  fingers: number[],
): { finger: number; fret: number; from: number; to: number } | null {
  // 以手指編號分組，找出同一手指壓在同一品格的多條弦
  const map = new Map<number, { fret: number; strings: number[] }>();

  frets.forEach((fret, i) => {
    if (fret === 'x' || fret === 0) return;
    const finger = fingers[i];
    if (!finger) return;
    if (!map.has(finger)) map.set(finger, { fret: fret as number, strings: [] });
    const entry = map.get(finger)!;
    if (entry.fret === fret) entry.strings.push(i + 1); // 1-indexed
  });

  for (const [finger, { fret, strings }] of map) {
    if (strings.length >= 2) {
      return { finger, fret, from: Math.min(...strings), to: Math.max(...strings) };
    }
  }
  return null;
}

// ── SVG text 輔助 ─────────────────────────────────────────────────
function text(
  x: number,
  y: number,
  content: string,
  anchor: 'middle' | 'start' | 'end' = 'middle',
  size = 11,
  bold = false,
  fill = '#333',
): string {
  return `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" font-family="system-ui, sans-serif" font-weight="${bold ? 'bold' : 'normal'}" fill="${fill}">${content}</text>`;
}
