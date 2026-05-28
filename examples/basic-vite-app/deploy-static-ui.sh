#!/usr/bin/env bash

set -euo pipefail

# 用法 1: 按 /home/app/<project-name>/ui/<target-path> 目录模型发布
#   /home/app/deploy-static-ui.sh <project-name> <target-path> <uploaded-release-dir>
#
# 用法 2: 直接传最终线上绝对目录
#   /home/app/deploy-static-ui.sh --live-root <absolute-live-root> <uploaded-release-dir> [source-subdir]
#
# 示例 1:
#   /home/app/deploy-static-ui.sh demo-project basic-vite-app /home/app/demo-project/ui/releases/basic-vite-app-20260527120000-a1b2c3
#
# 示例 2:
#   /home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3
#
# 示例 3:
#   /home/app/deploy-static-ui.sh --live-root /mnt/data/app/dist /mnt/data/app/releases/app-20260527120000-a1b2c3 app

MODE="${1:-}"
PROJECT_NAME=""
TARGET_PATH=""
SOURCE_ROOT=""
SOURCE_SUBDIR=""
LIVE_ROOT=""
BACKUP_ROOT=""
TIMESTAMP="$(date +%Y%m%d%H%M%S)"

print_usage() {
  echo "用法 1: $0 <project-name> <target-path> <uploaded-release-dir>"
  echo "用法 2: $0 --live-root <absolute-live-root> <uploaded-release-dir> [source-subdir]"
}

if [[ "${MODE}" == "--live-root" ]]; then
  LIVE_ROOT="${2:-}"
  SOURCE_ROOT="${3:-}"
  SOURCE_SUBDIR="${4:-}"

  if [[ -z "${LIVE_ROOT}" || -z "${SOURCE_ROOT}" ]]; then
    print_usage
    exit 1
  fi

  BACKUP_ROOT="${LIVE_ROOT}/.deploy-backups"
else
  PROJECT_NAME="${1:-}"
  TARGET_PATH="${2:-}"
  SOURCE_ROOT="${3:-}"

  if [[ -z "${PROJECT_NAME}" || -z "${TARGET_PATH}" || -z "${SOURCE_ROOT}" ]]; then
    print_usage
    exit 1
  fi

  PROJECT_BASE="/home/app/${PROJECT_NAME}"
  UI_BASE="${PROJECT_BASE}/ui"
  LIVE_ROOT="${UI_BASE}/${TARGET_PATH}"
  BACKUP_ROOT="${UI_BASE}/.deploy-backups/${TARGET_PATH}"
fi

if [[ -z "${LIVE_ROOT}" || -z "${SOURCE_ROOT}" ]]; then
  print_usage
  exit 1
fi

if [[ ! -d "${SOURCE_ROOT}" ]]; then
  echo "发布目录不存在: ${SOURCE_ROOT}"
  exit 1
fi

# 兼容三种传参:
# 1. 直接传构建产物目录
# 2. 传 release 根目录，脚本自动进入 <source-subdir> 或 <target-path> 子目录
# 3. 传只包含一个构建子目录的 release 根目录，脚本自动识别该子目录
resolve_single_nested_source_dir() {
  local candidate="$1"
  local matched_dir=""
  local matched_count=0

  shopt -s nullglob
  for dir in "${candidate}"/*/; do
    dir="${dir%/}"
    if [[ -f "${dir}/index.html" ]]; then
      matched_dir="${dir}"
      matched_count=$((matched_count + 1))
    fi
  done
  shopt -u nullglob

  if [[ "${matched_count}" -eq 1 ]]; then
    printf '%s\n' "${matched_dir}"
    return 0
  fi

  return 1
}

resolve_source_dir() {
  local candidate="$1"
  local source_subdir="$2"
  local nested_dir=""

  if [[ -f "${candidate}/index.html" ]]; then
    printf '%s\n' "${candidate}"
    return 0
  fi

  if [[ -n "${source_subdir}" && -f "${candidate}/${source_subdir}/index.html" ]]; then
    printf '%s\n' "${candidate}/${source_subdir}"
    return 0
  fi

  nested_dir="$(resolve_single_nested_source_dir "${candidate}")" || true
  if [[ -n "${nested_dir}" ]]; then
    printf '%s\n' "${nested_dir}"
    return 0
  fi

  return 1
}

if [[ -z "${SOURCE_SUBDIR}" && -n "${TARGET_PATH}" ]]; then
  SOURCE_SUBDIR="${TARGET_PATH}"
fi

SOURCE_DIR="$(resolve_source_dir "${SOURCE_ROOT}" "${SOURCE_SUBDIR}")" || {
  echo "未找到可发布目录"
  exit 1
}

mkdir -p "${LIVE_ROOT}" "${BACKUP_ROOT}"

if [[ -n "${PROJECT_NAME}" ]]; then
  echo "项目名: ${PROJECT_NAME}"
fi
if [[ -n "${TARGET_PATH}" ]]; then
  echo "目标目录: ${TARGET_PATH}"
fi
if [[ -n "${SOURCE_SUBDIR}" ]]; then
  echo "构建子目录: ${SOURCE_SUBDIR}"
fi
echo "源目录: ${SOURCE_DIR}"
echo "线上目录: ${LIVE_ROOT}"

if [[ -f "${LIVE_ROOT}/index.html" ]]; then
  cp "${LIVE_ROOT}/index.html" "${BACKUP_ROOT}/index-${TIMESTAMP}.html"
fi

if [[ -f "${LIVE_ROOT}/version.json" ]]; then
  cp "${LIVE_ROOT}/version.json" "${BACKUP_ROOT}/version-${TIMESTAMP}.json"
fi

echo "[1/3] 同步静态资源"
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude 'index.html' --exclude 'version.json' "${SOURCE_DIR}/" "${LIVE_ROOT}/"
else
  tar --exclude='./index.html' --exclude='./version.json' -cf - -C "${SOURCE_DIR}" . | tar -xf - -C "${LIVE_ROOT}"
fi

echo "[2/3] 替换 index.html"
cp "${SOURCE_DIR}/index.html" "${LIVE_ROOT}/index.html"

if [[ -f "${SOURCE_DIR}/version.json" ]]; then
  echo "[3/3] 替换 version.json"
  cp "${SOURCE_DIR}/version.json" "${LIVE_ROOT}/version.json"
else
  echo "[3/3] 跳过 version.json（源目录不存在）"
fi

echo "发布完成"
