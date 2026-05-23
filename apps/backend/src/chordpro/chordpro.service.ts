import { Injectable, BadRequestException } from '@nestjs/common';
import { ChordProParser, HtmlDivFormatter, TextFormatter } from 'chordsheetjs';
import type { ChordDefinition, ParseResult } from 'shared';

@Injectable()
export class ChordProService {
  parse(chordproText: string): ParseResult {
    try {
      const song = new ChordProParser().parse(chordproText);

      const textFormatter = new TextFormatter();
      const htmlFormatter = new HtmlDivFormatter();

      // chordsheetjs 的 title/artist/key 可能是 string | string[]，統一 normalize 為 string | null
      const normalize = (v: string | string[] | null | undefined): string | null =>
        Array.isArray(v) ? v.join(', ') : (v ?? null);

      // chordsheetjs 本身解析到的定義（不支援含 * 的和弦名）
      const rawDefs: Record<string, any> = song.chordDefinitions?.definitions ?? {};
      const parsedByLib = new Set(Object.keys(rawDefs));

      const libDefinitions: ChordDefinition[] = Object.values(rawDefs).map((d: any) => ({
        name: d.name as string,
        baseFret: (d.baseFret as number) ?? 1,
        frets: (d.frets as (number | 'x')[]) ?? [],
        fingers: (d.fingers as number[]) ?? [],
      }));

      // 用 regex 補充解析 chordsheetjs 無法處理的 {define}（如含 * 的名稱）
      const fallbackDefinitions = this.parseDefinesWithRegex(chordproText, parsedByLib);

      // 合併：lib 解析結果為主，regex 補充漏網的
      const definitions = [...libDefinitions, ...fallbackDefinitions];

      return {
        title: normalize(song.title),
        artist: normalize(song.artist),
        key: normalize(song.key),
        text: textFormatter.format(song),
        html: htmlFormatter.format(song),
        definitions,
      };
    } catch (err) {
      throw new BadRequestException('Invalid ChordPro format');
    }
  }

  /**
   * 用 regex 解析 chordsheetjs 無法處理的 {define} 指令。
   * 例：{define: E* base-fret 1 frets 0 2 2 1 0 0 fingers 0 2 3 1 0 0}
   *
   * @param text  原始 ChordPro 文字
   * @param skip  已由 chordsheetjs 解析的和弦名集合（避免重複）
   */
  private parseDefinesWithRegex(text: string, skip: Set<string>): ChordDefinition[] {
    const DEFINE_RE =
      /\{define:\s*(\S+)\s+base-fret\s+(\d+)\s+frets\s+([\dx\s]+?)(?:\s+fingers\s+([\d\s]+?))?\s*\}/gi;

    const results: ChordDefinition[] = [];

    for (const match of text.matchAll(DEFINE_RE)) {
      const name = match[1];
      if (skip.has(name)) continue; // 已由 lib 解析，略過

      const baseFret = parseInt(match[2], 10);
      const frets = match[3]
        .trim()
        .split(/\s+/)
        .map((v) => (v === 'x' || v === 'X' ? ('x' as const) : parseInt(v, 10)));
      const fingers = match[4]
        ? match[4]
            .trim()
            .split(/\s+/)
            .map((v) => parseInt(v, 10))
        : [];

      results.push({ name, baseFret, frets, fingers });
    }

    return results;
  }
}
