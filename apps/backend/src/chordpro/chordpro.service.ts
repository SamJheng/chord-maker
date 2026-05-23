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

      return {
        title: normalize(song.title),
        artist: normalize(song.artist),
        key: normalize(song.key),
        text: textFormatter.format(song),
        html: htmlFormatter.format(song),
      };
    } catch (err) {
      throw new BadRequestException('Invalid ChordPro format');
    }
  }
}
