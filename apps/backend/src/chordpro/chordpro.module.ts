import { Module } from '@nestjs/common';
import { ChordProController } from './chordpro.controller';
import { ChordProService } from './chordpro.service';

@Module({
  controllers: [ChordProController],
  providers: [ChordProService],
})
export class ChordProModule {}
