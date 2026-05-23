import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  /** GET /api/songs — 列出所有歌譜 */
  @Get()
  findAll() {
    return this.songsService.findAll();
  }

  /** GET /api/songs/:id — 取得單首歌譜 */
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.songsService.findOne(id);
  }

  /** POST /api/songs — 新增歌譜 */
  @Post()
  create(@Body() dto: CreateSongDto) {
    return this.songsService.create(dto);
  }

  /** PATCH /api/songs/:id — 更新歌譜 */
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSongDto) {
    return this.songsService.update(id, dto);
  }

  /** DELETE /api/songs/:id — 刪除歌譜 */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.songsService.remove(id);
  }
}
