import { apiClient } from './client';

export interface ParseResult {
  title: string | null;
  artist: string | null;
  key: string | null;
  text: string;
  html: string;
}

/** 解析 ChordPro 格式字串 */
export async function parseChordPro(content: string): Promise<ParseResult> {
  const { data } = await apiClient.post<ParseResult>('/chordpro/parse', { content });
  return data;
}
