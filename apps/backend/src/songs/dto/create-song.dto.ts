import { IsString, IsOptional, IsNumber, IsNotEmpty, Min } from 'class-validator';
import type { CreateSongDto as ICreateSongDto } from 'shared';

export class CreateSongDto implements ICreateSongDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  artist?: string;

  @IsString()
  @IsOptional()
  key?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  bpm?: number;

  @IsString()
  @IsNotEmpty()
  content!: string;
}
