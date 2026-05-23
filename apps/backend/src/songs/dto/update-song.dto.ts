import { PartialType } from '@nestjs/mapped-types';
import type { UpdateSongDto as IUpdateSongDto } from 'shared';
import { CreateSongDto } from './create-song.dto';

export class UpdateSongDto extends PartialType(CreateSongDto) implements IUpdateSongDto {}
