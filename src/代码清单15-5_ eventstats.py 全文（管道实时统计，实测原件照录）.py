# 事件流实时统计：pi --mode json ... | python eventstats.py
# 逐行读 JSONL 事件，聚合工具调用与轮次，结束时输出报表
import sys
import json

tool_calls = []   # (toolName, isError)
turns = 0
events = {}       # type -> count

for line in sys.stdin:
    line = line.strip()
    if not line:
        continue
    try:
        ev = json.loads(line)
    except json.JSONDecodeError:
        continue
    t = ev.get("type", "?")
    events[t] = events.get(t, 0) + 1
    if t == "turn_start":
        turns += 1
    elif t == "tool_execution_end":
        tool_calls.append((ev.get("toolName", "?"), ev.get("isError", False)))

print("=" * 46)
print("工具调用统计")
print("=" * 46)
print(f"轮次总数：{turns}")
print(f"工具调用：{len(tool_calls)} 次")
for name, err in tool_calls:
    mark = "失败" if err else "成功"
    print(f"  - {name}（{mark}）")
print("-" * 46)
print("事件类型分布：")
for t, n in sorted(events.items(), key=lambda x: -x[1]):
    print(f"  {t:<24} {n}")