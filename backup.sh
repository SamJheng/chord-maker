#!/usr/bin/env bash
# ============================================================
# backup.sh — chord-maker PostgreSQL 備份腳本
#
# 用法：
#   ./backup.sh              # 完整備份（schema + data）
#   ./backup.sh --data-only  # 只備份資料（schema 由 migration 管）
#   ./backup.sh --restore backups/chordmaker_20260524_1200.sql
# ============================================================
set -euo pipefail

# ── 設定 ────────────────────────────────────────────────────
CONTAINER="chord-maker-postgres"
DB_USER="${POSTGRES_USER:-chordmaker}"
DB_NAME="${POSTGRES_DB:-chordmaker}"
BACKUP_DIR="$(dirname "$0")/backups"
KEEP_DAYS=30          # 自動刪除超過幾天的備份（0 = 不刪）

# ── 顏色輸出 ────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[backup]${NC} $*"; }
warn()  { echo -e "${YELLOW}[backup]${NC} $*"; }
error() { echo -e "${RED}[backup]${NC} $*" >&2; exit 1; }

# ── 前置檢查 ────────────────────────────────────────────────
check_container() {
  docker inspect "$CONTAINER" > /dev/null 2>&1 \
    || error "找不到 Docker 容器 '$CONTAINER'，請先執行 docker compose up -d postgres"
  docker inspect -f '{{.State.Running}}' "$CONTAINER" | grep -q true \
    || error "容器 '$CONTAINER' 目前沒有在執行"
}

# ── 備份 ────────────────────────────────────────────────────
do_backup() {
  local data_only="${1:-false}"
  mkdir -p "$BACKUP_DIR"

  local suffix="full"
  local extra_flags=""
  if [ "$data_only" = "true" ]; then
    suffix="data-only"
    extra_flags="--data-only"
  fi

  local filename="${DB_NAME}_$(date +%Y%m%d_%H%M)_${suffix}.sql"
  local filepath="$BACKUP_DIR/$filename"

  info "開始備份 → $filepath"
  check_container

  docker exec "$CONTAINER" \
    pg_dump -U "$DB_USER" --no-owner --no-privileges $extra_flags "$DB_NAME" \
    > "$filepath"

  local size
  size=$(du -sh "$filepath" | cut -f1)
  info "備份完成 ✓  大小：${size}  路徑：${filepath}"

  # 自動清理舊備份
  if [ "$KEEP_DAYS" -gt 0 ]; then
    local deleted
    deleted=$(find "$BACKUP_DIR" -name "*.sql" -mtime +"$KEEP_DAYS" -print -delete | wc -l | tr -d ' ')
    [ "$deleted" -gt 0 ] && warn "已清除 ${deleted} 個超過 ${KEEP_DAYS} 天的舊備份"
  fi
}

# ── 還原 ────────────────────────────────────────────────────
do_restore() {
  local filepath="$1"
  [ -f "$filepath" ] || error "找不到檔案：$filepath"

  warn "⚠️  即將還原資料庫 '$DB_NAME'，現有資料將被覆蓋"
  read -r -p "確認繼續？(yes/no) " confirm
  [ "$confirm" = "yes" ] || { info "已取消"; exit 0; }

  check_container

  info "開始還原 ← $filepath"
  docker exec -i "$CONTAINER" \
    psql -U "$DB_USER" "$DB_NAME" < "$filepath"
  info "還原完成 ✓"
}

# ── 列出備份 ─────────────────────────────────────────────────
do_list() {
  if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
    warn "尚無備份檔案（目錄：$BACKUP_DIR）"
    exit 0
  fi
  info "現有備份（$BACKUP_DIR）："
  ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | awk '{print "  " $5 "\t" $9}'
}

# ── 主流程 ───────────────────────────────────────────────────
case "${1:-}" in
  --data-only)
    do_backup "true"
    ;;
  --restore)
    [ -n "${2:-}" ] || error "請指定要還原的檔案：./backup.sh --restore <file.sql>"
    do_restore "$2"
    ;;
  --list)
    do_list
    ;;
  --help|-h)
    echo "用法："
    echo "  ./backup.sh              完整備份（schema + data）"
    echo "  ./backup.sh --data-only  只備份資料"
    echo "  ./backup.sh --restore <file.sql>  還原備份"
    echo "  ./backup.sh --list       列出所有備份"
    ;;
  "")
    do_backup "false"
    ;;
  *)
    error "未知參數：$1（執行 ./backup.sh --help 查看說明）"
    ;;
esac
