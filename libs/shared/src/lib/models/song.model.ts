import type { Timestamps } from './base.model';

/**
 * 歌譜共用型別 — 前後端共享
 */

/** 建立歌譜時的 payload */
export interface CreateSongDto {
  /** 歌曲名稱 */
  title: string;
  /** 演唱者／樂團 */
  artist?: string;
  /** 調性，例如 C、Am、G */
  key?: string;
  /** 每分鐘拍數 (Beats Per Minute) */
  bpm?: number;
  /** ChordPro 格式的原始譜面內容 */
  content: string;
}

/** 更新歌譜時的 payload（所有欄位皆可選） */
export type UpdateSongDto = Partial<CreateSongDto>;

/** 歌譜完整物件（API 回傳） */
export interface Song extends CreateSongDto, Timestamps {
  id: string;
}

/** 列表用精簡物件（不含完整內容） */
export type SongSummary = Omit<Song, 'content'>;
