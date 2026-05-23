import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreateSongDto } from 'shared';
import { getSong, createSong, updateSong } from '../api';
import { parseChordPro, type ParseResult } from '../api';

const EMPTY_FORM: CreateSongDto = {
  title: '',
  artist: '',
  key: '',
  bpm: undefined,
  content: '',
};

export function useSongEditor(id?: string) {
  const [form, setForm] = useState<CreateSongDto>(EMPTY_FORM);
  const [preview, setPreview] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 載入既有歌譜（編輯模式）
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getSong(id)
      .then((song) =>
        setForm({
          title: song.title,
          artist: song.artist ?? '',
          key: song.key ?? '',
          bpm: song.bpm,
          content: song.content,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // content 變更時延遲 400ms 呼叫預覽
  useEffect(() => {
    if (!form.content.trim()) { setPreview(null); return; }
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(async () => {
      try {
        setPreview(await parseChordPro(form.content));
      } catch { /* 預覽失敗靜默忽略 */ }
    }, 400);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [form.content]);

  const setField = useCallback(
    <K extends keyof CreateSongDto>(key: K, value: CreateSongDto[K]) =>
      setForm((prev) => ({ ...prev, [key]: value })),
    [],
  );

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const result = id
        ? await updateSong(id, form)
        : await createSong(form);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '儲存失敗');
      return null;
    } finally {
      setSaving(false);
    }
  }, [id, form]);

  return { form, setField, preview, loading, saving, error, save };
}
