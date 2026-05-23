/**
 * ChordPro 解析結果 — 前後端共享
 */

/** 單一和弦指法定義（來自 ChordPro {define} 指令） */
export interface ChordDefinition {
  /** 和弦名稱，例如 "E", "C#m" */
  name: string;
  /** 起始品格（1 = 開放弦區域） */
  baseFret: number;
  /**
   * 各弦按法，依序為第 1 弦（最低音 low-E）到第 6 弦（最高音 high-e）。
   * 0 = 空弦，'x' = 悶音，數字 = 相對於 baseFret 的品格位置。
   */
  frets: (number | 'x')[];
  /**
   * 各弦使用的手指編號（對應 frets 陣列）。
   * 0 = 不指定，1-4 = 食指～小指。
   */
  fingers?: number[];
}

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
  /** 歌譜中定義的和弦指法（來自 {define} 指令） */
  definitions: ChordDefinition[];
}

/** 解析 ChordPro 的請求 payload */
export interface ParseChordProDto {
  content: string;
}
