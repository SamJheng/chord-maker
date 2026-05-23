import axios from 'axios';
import type { Song, SongSummary } from 'shared';

// ── 測試用假資料 ──────────────────────────────────────────────
const SAMPLE_SONG = {
  title: '讓我留在你身邊',
  artist: '陳奕迅',
  key: 'C',
  bpm: 80,
  content: `{title: 讓我留在你身邊}
{artist: 陳奕迅}
{key: C}

[C]讓我[Am]留在[F]你身[G]邊
[C]就算[Am]只是[F]朋[G]友`,
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ── 輔助：建立一首歌，並在測試結束後自動清除 ──────────────────
async function createSong(overrides = {}): Promise<Song> {
  const res = await axios.post<Song>('/api/songs', { ...SAMPLE_SONG, ...overrides });
  return res.data;
}

async function deleteSong(id: string) {
  await axios.delete(`/api/songs/${id}`).catch(() => {
    // 已被刪除則忽略
  });
}

// ─────────────────────────────────────────────────────────────

describe('Songs CRUD API', () => {
  // ── POST /api/songs ────────────────────────────────────────
  describe('POST /api/songs', () => {
    let createdId: string;

    afterEach(() => deleteSong(createdId));

    it('應建立歌譜並回傳完整物件 (201)', async () => {
      const res = await axios.post<Song>('/api/songs', SAMPLE_SONG);

      expect(res.status).toBe(201);
      createdId = res.data.id;

      expect(res.data.id).toMatch(UUID_REGEX);
      expect(res.data.title).toBe(SAMPLE_SONG.title);
      expect(res.data.artist).toBe(SAMPLE_SONG.artist);
      expect(res.data.key).toBe(SAMPLE_SONG.key);
      expect(res.data.bpm).toBe(SAMPLE_SONG.bpm);
      expect(res.data.content).toBe(SAMPLE_SONG.content);
      expect(typeof res.data.createdAt).toBe('string');
      expect(typeof res.data.updatedAt).toBe('string');
    });

    it('選填欄位可省略 (201)', async () => {
      const res = await axios.post<Song>('/api/songs', {
        title: '無名之歌',
        content: '[C]測試',
      });

      expect(res.status).toBe(201);
      createdId = res.data.id;
      expect(res.data.title).toBe('無名之歌');
    });

    it('缺少 title 應回傳 400', async () => {
      await expect(
        axios.post('/api/songs', { content: '[C]沒有標題' })
      ).rejects.toMatchObject({ response: { status: 400 } });
    });

    it('缺少 content 應回傳 400', async () => {
      await expect(
        axios.post('/api/songs', { title: '沒有內容' })
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  // ── GET /api/songs ─────────────────────────────────────────
  describe('GET /api/songs', () => {
    let song: Song;

    beforeEach(async () => { song = await createSong(); });
    afterEach(() => deleteSong(song.id));

    it('應回傳陣列 (200)', async () => {
      const res = await axios.get<SongSummary[]>('/api/songs');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
    });

    it('列表中不應包含 content 欄位', async () => {
      const res = await axios.get<SongSummary[]>('/api/songs');
      const found = res.data.find((s) => s.id === song.id);

      expect(found).toBeDefined();
      expect((found as any).content).toBeUndefined();
    });

    it('列表應包含剛建立的歌譜', async () => {
      const res = await axios.get<SongSummary[]>('/api/songs');
      const ids = res.data.map((s) => s.id);

      expect(ids).toContain(song.id);
    });
  });

  // ── GET /api/songs/:id ─────────────────────────────────────
  describe('GET /api/songs/:id', () => {
    let song: Song;

    beforeEach(async () => { song = await createSong(); });
    afterEach(() => deleteSong(song.id));

    it('應回傳完整歌譜物件含 content (200)', async () => {
      const res = await axios.get<Song>(`/api/songs/${song.id}`);

      expect(res.status).toBe(200);
      expect(res.data.id).toBe(song.id);
      expect(res.data.content).toBe(SAMPLE_SONG.content);
    });

    it('不存在的 id 應回傳 404', async () => {
      await expect(
        axios.get('/api/songs/00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('無效的 UUID 格式應回傳 400', async () => {
      await expect(
        axios.get('/api/songs/not-a-valid-uuid')
      ).rejects.toMatchObject({ response: { status: 400 } });
    });
  });

  // ── PATCH /api/songs/:id ───────────────────────────────────
  describe('PATCH /api/songs/:id', () => {
    let song: Song;

    beforeEach(async () => { song = await createSong(); });
    afterEach(() => deleteSong(song.id));

    it('應更新指定欄位並回傳新物件 (200)', async () => {
      const res = await axios.patch<Song>(`/api/songs/${song.id}`, {
        title: '新標題',
        bpm: 120,
      });

      expect(res.status).toBe(200);
      expect(res.data.title).toBe('新標題');
      expect(res.data.bpm).toBe(120);
      // 未更新的欄位應保持不變
      expect(res.data.content).toBe(song.content);
    });

    it('updatedAt 應比 createdAt 新或相等', async () => {
      const res = await axios.patch<Song>(`/api/songs/${song.id}`, {
        title: '更新時間測試',
      });

      expect(new Date(res.data.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(res.data.createdAt).getTime()
      );
    });

    it('不存在的 id 應回傳 404', async () => {
      await expect(
        axios.patch('/api/songs/00000000-0000-0000-0000-000000000000', { title: 'x' })
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });

  // ── DELETE /api/songs/:id ──────────────────────────────────
  describe('DELETE /api/songs/:id', () => {
    let song: Song;

    beforeEach(async () => { song = await createSong(); });

    it('應刪除歌譜並回傳 204', async () => {
      const res = await axios.delete(`/api/songs/${song.id}`);
      expect(res.status).toBe(204);
    });

    it('刪除後 GET 應回傳 404', async () => {
      await axios.delete(`/api/songs/${song.id}`);

      await expect(
        axios.get(`/api/songs/${song.id}`)
      ).rejects.toMatchObject({ response: { status: 404 } });
    });

    it('不存在的 id 應回傳 404', async () => {
      await expect(
        axios.delete('/api/songs/00000000-0000-0000-0000-000000000000')
      ).rejects.toMatchObject({ response: { status: 404 } });
    });
  });
});
