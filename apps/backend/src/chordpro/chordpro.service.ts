import { Injectable, BadRequestException } from '@nestjs/common';
import { ChordProParser, HtmlDivFormatter, TextFormatter } from 'chordsheetjs';

@Injectable()
export class ChordProService {
  parse(chordproText: string) {
    try {
      const song = new ChordProParser().parse(chordproText);

      const textFormatter = new TextFormatter();
      const htmlFormatter = new HtmlDivFormatter();

      return {
        title: song.title ?? null,
        artist: song.artist ?? null,
        key: song.key ?? null,
        text: textFormatter.format(song),
        html: htmlFormatter.format(song),
      };
    } catch (err) {
      throw new BadRequestException('Invalid ChordPro format');
    }
  }
}
