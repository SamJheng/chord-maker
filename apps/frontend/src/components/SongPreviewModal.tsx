import { useEffect, useState } from 'react';
import type { SongSummary } from 'shared';
import { getSong } from '../api/songs.api';
import { parseChordPro, type ParseResult } from '../api/chordpro.api';
import { ChordDiagram } from '@chord-maker/ui';

interface Props {
  song: SongSummary | null;
  onClose: () => void;
}

export function SongPreviewModal({ song, onClose }: Props) {
  const [preview, setPreview] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 載入並解析歌譜
  useEffect(() => {
    if (!song) { setPreview(null); setError(null); return; }
    setLoading(true);
    setError(null);
    getSong(song.id)
      .then((full) => parseChordPro(full.content))
      .then(setPreview)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [song]);

  // ESC 鍵關閉
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (song) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [song, onClose]);

  if (!song) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* Modal 內容 */}
      <div className="relative bg-base-100 rounded-box shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-base-300">
          <div>
            <h3 className="text-lg font-bold">{song.title}</h3>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {song.artist && (
                <span className="badge badge-secondary badge-sm">🎤 {song.artist}</span>
              )}
              {song.key && (
                <span className="badge badge-primary badge-sm">🎼 {song.key}</span>
              )}
              {song.bpm && (
                <span className="badge badge-ghost badge-sm">{song.bpm} BPM</span>
              )}
            </div>
          </div>
          <button className="btn btn-sm btn-circle btn-ghost ml-4" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 flex-1">
          {loading && (
            <div className="flex justify-center py-10">
              <span className="loading loading-spinner loading-md" />
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          {!loading && !error && preview && (
            <>
              {/* 和弦指法圖 */}
              {preview.definitions.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs text-base-content/50 mb-2 uppercase tracking-wider">和弦指法</p>
                  <div className="flex flex-wrap gap-3">
                    {preview.definitions.map((def) => (
                      <ChordDiagram key={def.name} definition={def} />
                    ))}
                  </div>
                  <div className="divider my-3" />
                </div>
              )}

              {/* 歌譜內容 */}
              <div
                className="chord-sheet font-mono text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: preview.html }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
