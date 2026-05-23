import type { ParseResult } from 'shared';
import { ChordDiagram } from './ChordDiagram';

interface Props {
  preview: ParseResult;
  className?: string;
}

/**
 * 渲染 ChordPro 解析結果：
 * - 若有 {define} 指令，在上方顯示和弦指法圖
 * - 歌譜主體（chord-sheet HTML）
 */
export function ChordProPreview({ preview, className }: Props) {
  return (
    <div className={className}>
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

      {/* 歌譜主體 */}
      <div
        className="chord-sheet font-mono text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: preview.html }}
      />
    </div>
  );
}
