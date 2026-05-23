import { useNavigate, useParams } from 'react-router-dom';
import { ChordProPreview } from '@chord-maker/ui';
import { useSongEditor } from '../hooks/useSongEditor';

export function SongEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { form, setField, preview, loading, saving, error, save } = useSongEditor(id);

  const isEdit = Boolean(id);

  const handleSave = async () => {
    const result = await save();
    if (result) navigate('/songs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 p-6">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/songs')}>
            ← 返回
          </button>
          <h1 className="text-2xl font-bold flex-1">
            {isEdit ? '編輯歌譜' : '新增歌譜'}
          </h1>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={saving || !form.title.trim() || !form.content.trim()}
          >
            {saving
              ? <><span className="loading loading-spinner loading-xs" /> 儲存中...</>
              : '💾 儲存'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        {/* Main: 左欄表單 + 右欄預覽 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* 左欄：表單 */}
          <div className="card bg-base-100">
            <div className="card-body space-y-4">
              <h2 className="card-title text-base">基本資訊</h2>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">歌曲名稱 *</legend>
                <input
                  type="text"
                  className="input w-full"
                  placeholder="例：讓我留在你身邊"
                  value={form.title}
                  onChange={(e) => setField('title', e.target.value)}
                />
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <fieldset className="fieldset">
                  <legend className="fieldset-legend">演唱者</legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="例：陳奕迅"
                    value={form.artist ?? ''}
                    onChange={(e) => setField('artist', e.target.value)}
                  />
                </fieldset>

                <fieldset className="fieldset">
                  <legend className="fieldset-legend">調性</legend>
                  <input
                    type="text"
                    className="input w-full"
                    placeholder="例：C、Am"
                    value={form.key ?? ''}
                    onChange={(e) => setField('key', e.target.value)}
                  />
                </fieldset>
              </div>

              <fieldset className="fieldset">
                <legend className="fieldset-legend">BPM</legend>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="例：80"
                  min={1}
                  value={form.bpm ?? ''}
                  onChange={(e) =>
                    setField('bpm', e.target.value ? Number(e.target.value) : undefined)
                  }
                />
              </fieldset>

              <fieldset className="fieldset flex-1">
                <legend className="fieldset-legend">ChordPro 內容 *</legend>
                <textarea
                  className="textarea w-full font-mono text-sm"
                  rows={16}
                  placeholder={`{title: 歌名}\n{artist: 歌手}\n{key: C}\n\n[C]歌詞[Am]歌詞[F]歌詞[G]歌詞`}
                  value={form.content}
                  onChange={(e) => setField('content', e.target.value)}
                />
              </fieldset>
            </div>
          </div>

          {/* 右欄：即時預覽 */}
          <div className="card bg-base-100">
            <div className="card-body">
              <h2 className="card-title text-base">即時預覽</h2>

              {!preview && (
                <div className="flex flex-col items-center justify-center h-64 text-base-content/40 text-sm">
                  <p className="text-3xl mb-2">🎵</p>
                  <p>輸入 ChordPro 內容即可預覽</p>
                </div>
              )}

              {preview && (
                <div className="space-y-4">
                  {/* Metadata badges */}
                  <div className="flex flex-wrap gap-2">
                    {preview.title && (
                      <span className="badge badge-primary">{preview.title}</span>
                    )}
                    {preview.artist && (
                      <span className="badge badge-secondary">{preview.artist}</span>
                    )}
                    {preview.key && (
                      <span className="badge badge-accent">🎼 {preview.key}</span>
                    )}
                  </div>

                  <ChordProPreview preview={preview} />
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
