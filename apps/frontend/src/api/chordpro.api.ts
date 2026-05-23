import type { ParseResult } from 'shared';
import { apiClient } from './client';

export type { ParseResult };

/** 解析 ChordPro 格式字串 */
export async function parseChordPro(content: string): Promise<ParseResult> {
  const { data } = await apiClient.post<ParseResult>('/chordpro/parse', { content });
  return data;
}
