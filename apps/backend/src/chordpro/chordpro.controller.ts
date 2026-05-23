import { Body, Controller, Post } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { ChordProService } from './chordpro.service';

class ParseChordProDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

@Controller('chordpro')
export class ChordProController {
  constructor(private readonly chordProService: ChordProService) {}

  @Post('parse')
  parse(@Body() dto: ParseChordProDto) {
    return this.chordProService.parse(dto.content);
  }
}
