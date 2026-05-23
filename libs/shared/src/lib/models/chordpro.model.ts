/**
 * ChordPro 解析結果 — 前後端共享
 */
export interface ParseResult {
  /** 歌曲標題（從 ChordPro 標頭解析） */
  title: string | null;
  /** 演唱者（從 ChordPro 標頭解析） */
  artist: string | null;
  /** 調性（從 ChordPro 標頭解析） */
  key: string | null;
  /** 純文字格式輸出 */
  text: string;
  /** HTML 格式輸出 */
  html: string;
}

/** 解析 ChordPro 的請求 payload */
export interface ParseChordProDto {
  content: string;
}
