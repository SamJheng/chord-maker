import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SongSummary } from 'shared';
import { useSongs } from '../hooks/useSongs';
import { SongPreviewModal } from '../components';

export function SongsPage() {
  const navigate = useNavigate();
  const { songs, loading, error, remove } = useSongs();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewSong, setPreviewSong] = useState<SongSummary | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try { await remove(id); } finally { setDeletingId(null); }
  };

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🎸 我的歌譜</h1>
            <p className="text-base-content/60 mt-1">管理所有 ChordPro 吉他譜</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/songs/new')}>
            + 新增歌譜
          </button>
        </div>

        {/* Error */}
        {error && <div className="alert alert-error"><span>{error}</span></div>}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        )}

        {/* Empty state */}
        {!loading && songs.length === 0 && !error && (
          <div className="card bg-base-100 text-center py-16">
            <div className="card-body items-center">
              <p className="text-5xl mb-4">🎵</p>
              <h2 className="card-title">還沒有歌譜</h2>
              <p className="text-base-content/60">點擊右上角新增第一首吉他譜吧！</p>
              <button className="btn btn-primary mt-4" onClick={() => navigate('/songs/new')}>
                新增歌譜
              </button>
            </div>
          </div>
        )}

        {/* Song list */}
        {!loading && songs.length > 0 && (
          <div className="flex flex-col gap-3">
            {songs.map((song) => (
              <div key={song.id} className="card bg-base-100 hover:shadow-md transition-shadow">
                <div className="card-body flex-row items-center py-4 px-5">

                  {/* 點標題直接預覽 */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setPreviewSong(song)}
                  >
                    <h2 className="font-semibold text-base truncate hover:text-primary transition-colors">
                      {song.title}
                    </h2>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {song.artist && (
                        <span className="badge badge-ghost badge-sm">🎤 {song.artist}</span>
                      )}
                      {song.key && (
                        <span className="badge badge-primary badge-sm">{song.key}</span>
                      )}
                      {song.bpm && (
                        <span className="badge badge-ghost badge-sm">{song.bpm} BPM</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 shrink-0">
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setPreviewSong(song)}
                    >
                      👁 預覽
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => navigate(`/songs/${song.id}/edit`)}
                    >
                      編輯
                    </button>
                    <button
                      className="btn btn-sm btn-error btn-outline"
                      disabled={deletingId === song.id}
                      onClick={() => handleDelete(song.id)}
                    >
                      {deletingId === song.id
                        ? <span className="loading loading-spinner loading-xs" />
                        : '刪除'}
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <SongPreviewModal
        song={previewSong}
        onClose={() => setPreviewSong(null)}
      />
    </div>
  );
}
