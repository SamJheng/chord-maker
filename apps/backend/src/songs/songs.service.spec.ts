import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Song } from './song.entity';
import { SongsService } from './songs.service';
import { CreateSongDto } from './dto/create-song.dto';

// ── 假資料工廠 ──────────────────────────────────────────────
const NOW = new Date('2026-01-01T00:00:00.000Z');

function makeSong(overrides: Partial<Song> = {}): Song {
  const song = new Song();
  song.id = 'uuid-1';
  song.title = '測試歌曲';
  song.artist = '測試歌手';
  song.key = 'C';
  song.bpm = 120;
  song.content = '[C]測試';
  song.createdAt = NOW;
  song.updatedAt = NOW;
  return Object.assign(song, overrides);
}

// ── Mock Repository ─────────────────────────────────────────
type MockRepo = Partial<Record<keyof Repository<Song>, jest.Mock>>;

function createMockRepo(): MockRepo {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

// ── Tests ───────────────────────────────────────────────────
describe('SongsService', () => {
  let service: SongsService;
  let repo: MockRepo;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SongsService,
        { provide: getRepositoryToken(Song), useValue: repo },
      ],
    }).compile();

    service = module.get(SongsService);
  });

  // ── findAll ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('回傳 SongSummary 陣列（不含 content）', async () => {
      repo.find!.mockResolvedValue([makeSong()]);

      const result = await service.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('uuid-1');
      expect(result[0].title).toBe('測試歌曲');
      expect((result[0] as any).content).toBeUndefined();
    });

    it('DB 回傳空陣列時回傳 []', async () => {
      repo.find!.mockResolvedValue([]);
      expect(await service.findAll()).toEqual([]);
    });

    it('createdAt / updatedAt 轉為 ISO string', async () => {
      repo.find!.mockResolvedValue([makeSong()]);
      const result = await service.findAll();
      expect(result[0].createdAt).toBe('2026-01-01T00:00:00.000Z');
    });
  });

  // ── findOne ──────────────────────────────────────────────
  describe('findOne()', () => {
    it('找到歌譜時回傳完整物件（含 content）', async () => {
      repo.findOne!.mockResolvedValue(makeSong());

      const result = await service.findOne('uuid-1');

      expect(result.id).toBe('uuid-1');
      expect(result.content).toBe('[C]測試');
    });

    it('找不到時拋出 NotFoundException', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.findOne('not-exist')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ───────────────────────────────────────────────
  describe('create()', () => {
    it('建立並回傳歌譜', async () => {
      const dto: CreateSongDto = { title: '新歌', content: '[G]歌詞' };
      const saved = makeSong({ title: '新歌', content: '[G]歌詞' });

      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalled();
      expect(result.title).toBe('新歌');
      expect(result.content).toBe('[G]歌詞');
    });

    it('回傳物件的日期為 ISO string', async () => {
      const dto: CreateSongDto = { title: '新歌', content: '[G]歌詞' };
      const saved = makeSong();
      repo.create!.mockReturnValue(saved);
      repo.save!.mockResolvedValue(saved);

      const result = await service.create(dto);
      expect(typeof result.createdAt).toBe('string');
    });
  });

  // ── update ───────────────────────────────────────────────
  describe('update()', () => {
    it('更新指定欄位並回傳新物件', async () => {
      const original = makeSong();
      const updated = makeSong({ title: '修改後標題', updatedAt: new Date() });

      repo.findOne!.mockResolvedValue(original);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { title: '修改後標題' });

      expect(result.title).toBe('修改後標題');
    });

    it('找不到時拋出 NotFoundException', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.update('not-exist', { title: 'x' })).rejects.toThrow(NotFoundException);
    });

    it('找不到時不呼叫 save', async () => {
      repo.findOne!.mockResolvedValue(null);
      await service.update('not-exist', {}).catch(() => null);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  // ── remove ───────────────────────────────────────────────
  describe('remove()', () => {
    it('成功刪除不拋出錯誤', async () => {
      repo.findOne!.mockResolvedValue(makeSong());
      repo.remove!.mockResolvedValue(undefined);
      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });

    it('找不到時拋出 NotFoundException', async () => {
      repo.findOne!.mockResolvedValue(null);
      await expect(service.remove('not-exist')).rejects.toThrow(NotFoundException);
    });

    it('找不到時不呼叫 remove', async () => {
      repo.findOne!.mockResolvedValue(null);
      await service.remove('not-exist').catch(() => null);
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });
});
