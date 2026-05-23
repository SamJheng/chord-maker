import { useCallback, useEffect, useState } from 'react';
import type { SongSummary } from 'shared';
import { getSongs, deleteSong } from '../api';

export function useSongs() {
  const [songs, setSongs] = useState<SongSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSongs(await getSongs());
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteSong(id);
    setSongs((prev) => prev.filter((s) => s.id !== id));
  }, []);

  useEffect(() => { fetchSongs(); }, [fetchSongs]);

  return { songs, loading, error, refetch: fetchSongs, remove };
}
