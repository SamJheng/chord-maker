import { useState } from 'react';

interface ParseResult {
  title: string | null;
  artist: string | null;
  key: string | null;
  text: string;
  html: string;
}

const DEFAULT_CONTENT = `{title: 讓我留在你身邊}
{artist: 陳奕迅}
{key: C}

[C]讓我[Am]留在[F]你身[G]邊
[C]就算[Am]只是[F]朋[G]友

[F]我願[G]意用[Am]盡我[Em]所有
[F]換你[G]一個[C]笑[G]容`;

export function ChordProPage() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chordpro/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '發生錯誤');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white">🎸 Chord Maker</h1>
          <p className="text-gray-400 mt-1">輸入 ChordPro 格式，產生吉他譜</p>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">ChordPro 內容</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 text-gray-100 font-mono text-sm p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
            placeholder="{title: 歌名}&#10;{key: C}&#10;&#10;[C]歌詞[Am]歌詞"
          />
        </div>

        {/* Button */}
        <button
          onClick={handleParse}
          disabled={loading || !content.trim()}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg transition-colors"
        >
          {loading ? '解析中...' : '解析吉他譜'}
        </button>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-900/40 border border-red-700 text-red-300 px-4 py-3">
            {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-4">

            {/* Metadata */}
            <div className="flex flex-wrap gap-3">
              {result.title && (
                <span className="px-3 py-1 bg-blue-900/50 border border-blue-700 rounded-full text-sm text-blue-300">
                  🎵 {result.title}
                </span>
              )}
              {result.artist && (
                <span className="px-3 py-1 bg-purple-900/50 border border-purple-700 rounded-full text-sm text-purple-300">
                  🎤 {result.artist}
                </span>
              )}
              {result.key && (
                <span className="px-3 py-1 bg-green-900/50 border border-green-700 rounded-full text-sm text-green-300">
                  🎼 調性：{result.key}
                </span>
              )}
            </div>

            {/* Chord Sheet */}
            <div className="rounded-lg bg-gray-900 border border-gray-700 p-6">
              <h2 className="text-sm font-medium text-gray-400 mb-4">吉他譜</h2>
              <div
                className="chord-sheet font-mono text-base leading-relaxed"
                dangerouslySetInnerHTML={{ __html: result.html }}
              />
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
