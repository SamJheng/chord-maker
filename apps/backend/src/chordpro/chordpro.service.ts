import { Injectable, BadRequestException } from '@nestjs/common';
import { ChordProParser, HtmlDivFormatter, TextFormatter } from 'chordsheetjs';
import type { ParseResult } from 'shared';

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

      // 提取 {define} 和弦指法定義
      const rawDefs: Record<string, any> = song.chordDefinitions?.definitions ?? {};
      const definitions = Object.values(rawDefs).map((d: any) => ({
        name: d.name as string,
        baseFret: (d.baseFret as number) ?? 1,
        frets: (d.frets as (number | 'x')[]) ?? [],
        fingers: (d.fingers as number[]) ?? [],
      }));

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
}
