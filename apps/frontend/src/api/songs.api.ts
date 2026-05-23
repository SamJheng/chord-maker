import type { Song, SongSummary, CreateSongDto, UpdateSongDto } from 'shared';
import { apiClient } from './client';

/** 取得所有歌譜（精簡版，不含 content） */
export async function getSongs(): Promise<SongSummary[]> {
  const { data } = await apiClient.get<SongSummary[]>('/songs');
  return data;
}

/** 取得單首歌譜（含完整 content） */
export async function getSong(id: string): Promise<Song> {
  const { data } = await apiClient.get<Song>(`/songs/${id}`);
  return data;
}

/** 新增歌譜 */
export async function createSong(dto: CreateSongDto): Promise<Song> {
  const { data } = await apiClient.post<Song>('/songs', dto);
  return data;
}

/** 更新歌譜 */
export async function updateSong(id: string, dto: UpdateSongDto): Promise<Song> {
  const { data } = await apiClient.patch<Song>(`/songs/${id}`, dto);
  return data;
}

/** 刪除歌譜 */
export async function deleteSong(id: string): Promise<void> {
  await apiClient.delete(`/songs/${id}`);
}
