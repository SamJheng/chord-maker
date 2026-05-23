import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Song as ISong, SongSummary } from 'shared';
import { Song } from './song.entity';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongsService {
  constructor(
    @InjectRepository(Song)
    private readonly songsRepository: Repository<Song>,
  ) {}

  /** 取得所有歌譜（精簡版，不含 content） */
  async findAll(): Promise<SongSummary[]> {
    const songs = await this.songsRepository.find({
      select: { id: true, title: true, artist: true, key: true, bpm: true, createdAt: true, updatedAt: true },
      order: { createdAt: 'DESC' },
    });
    return songs.map(this.toSongSummary);
  }

  /** 取得單首歌譜（含完整 content） */
  async findOne(id: string): Promise<ISong> {
    const song = await this.songsRepository.findOne({ where: { id } });
    if (!song) throw new NotFoundException(`找不到歌譜 id=${id}`);
    return this.toSong(song);
  }

  /** 建立歌譜 */
  async create(dto: CreateSongDto): Promise<ISong> {
    const song = this.songsRepository.create(dto);
    const saved = await this.songsRepository.save(song);
    return this.toSong(saved);
  }

  /** 更新歌譜 */
  async update(id: string, dto: UpdateSongDto): Promise<ISong> {
    const song = await this.songsRepository.findOne({ where: { id } });
    if (!song) throw new NotFoundException(`找不到歌譜 id=${id}`);
    Object.assign(song, dto);
    const saved = await this.songsRepository.save(song);
    return this.toSong(saved);
  }

  /** 刪除歌譜 */
  async remove(id: string): Promise<void> {
    const song = await this.songsRepository.findOne({ where: { id } });
    if (!song) throw new NotFoundException(`找不到歌譜 id=${id}`);
    await this.songsRepository.remove(song);
  }

  // --- 私有轉換方法：Date → ISO string ---

  private toSong(song: Song): ISong {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      key: song.key,
      bpm: song.bpm,
      content: song.content,
      createdAt: song.createdAt.toISOString(),
      updatedAt: song.updatedAt.toISOString(),
    };
  }

  private toSongSummary(song: Song): SongSummary {
    return {
      id: song.id,
      title: song.title,
      artist: song.artist,
      key: song.key,
      bpm: song.bpm,
      createdAt: song.createdAt.toISOString(),
      updatedAt: song.updatedAt.toISOString(),
    };
  }
}
