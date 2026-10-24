#!/usr/bin/env bash
# ci/pipeline.sh：四段流水线
# 用法：bash ci/pipeline.sh [--inject-fail]
# 退出码协议（本脚本自设，沿第 17 章退出码协议思想）：
#   0 = 跑绿    1 = 产出不过卡    2 = 基础设施错误（凭据/环境）
set -uo pipefail
INJECT=0; [ "${1:-}" = "--inject-fail" ] && INJECT=1

# ── stage 1/4 checkout：生成分支 diff，断言非空（空 diff 无活可干）
echo "stage 1/4 checkout"
git diff main...feat/discount > ci/artifacts/pr.diff
if [ ! -s ci/artifacts/pr.diff ]; then
  echo "stage 1/4 ABORT: diff 为空"; exit 2
fi
echo "stage 1/4 ok: $(wc -l < ci/artifacts/pr.diff) 行 diff"

# ── stage 2/4 agent：Pi 无头生成 PR 摘要（进程外调用，即弃即走）
echo "stage 2/4 agent: 无头生成 PR 摘要"
pi -p --no-session --model <轻量档> @ci/artifacts/pr.diff \
  "你是流水线里的摘要机器人。基于这个 diff 产出 PR 摘要，必须且只能包含三节，节标题依次为：改了什么、为什么改、风险点。" \
  > ci/artifacts/summary.md
if [ $? -ne 0 ]; then
  echo "stage 2/4 FATAL: 调用失败（凭据或环境问题）"; exit 2
fi
echo "stage 2/4 ok: 摘要 $(wc -c < ci/artifacts/summary.md) 字节"

# ── stage 2.5 inject-fail：产出截到 80 字节，模拟半截产出（仅 --inject-fail 生效）
if [ "$INJECT" = "1" ]; then
  head -c 80 ci/artifacts/summary.md > ci/artifacts/summary.tmp
  mv ci/artifacts/summary.tmp ci/artifacts/summary.md
  echo "stage 2.5 inject-fail: 产出截断（模拟半截产出）"
fi

# ── stage 3/4 gate：设卡校验（结构卡 + 内容锚双卡）
echo "stage 3/4 gate: 设卡校验"
FAIL=0
for sec in "改了什么" "为什么改" "风险点"; do
  grep -q "$sec" ci/artifacts/summary.md || { echo "GATE 缺节: $sec"; FAIL=1; }
done
grep -q "discount" ci/artifacts/summary.md || { echo "GATE 缺锚: discount"; FAIL=1; }
if [ "$FAIL" = "1" ]; then
  echo "stage 3/4 BLOCKED: 产出不过卡，禁止发布"; exit 1
fi
echo "stage 3/4 ok: 三节齐全 + 改动函数锚定"

# ── stage 4/4 publish：摘要落 artifacts，汇总报绿
echo "stage 4/4 publish"
cp ci/artifacts/summary.md ci/artifacts/summary.final
echo "RUN GREEN: 4/4 全部通过"
exit 0