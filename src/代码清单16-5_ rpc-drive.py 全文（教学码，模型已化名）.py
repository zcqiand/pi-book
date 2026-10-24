# rpc-drive.py：从外部进程驱动 Pi（RPC 通道；官方最小客户端形态改写，模型已化名）
# 通信全程逐行落盘 rpc-log.jsonl；收尾关 stdin，让 Pi 有序退出
import json
import shutil
import subprocess

proc = subprocess.Popen(
    [shutil.which("pi"), "--mode", "rpc", "--no-session", "--model", "<轻量档>"],
    stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True, encoding="utf-8",
)
log = open("rpc-log.jsonl", "w", encoding="utf-8")

def send(cmd):
    """命令流：往 stdin 写一行 JSON，发出即记账。"""
    line = json.dumps(cmd, ensure_ascii=False)
    proc.stdin.write(line + "\n")
    proc.stdin.flush()
    log.write(line + "\n")

def read_until(want_id=None, want_event=None):
    """响应与事件流：stdout 逐行读并记账，等来指定响应或指定事件即停。"""
    while True:
        rec = json.loads(proc.stdout.readline())
        log.write(json.dumps(rec, ensure_ascii=False) + "\n")
        if want_id and rec.get("type") == "response" and rec.get("id") == want_id:
            return rec
        if want_event and rec.get("type") == want_event:
            return rec

# ① 探底：当前状态（model、isStreaming、messageCount 等都从这条回来）
send({"id": "r1", "type": "get_state"})
state = read_until(want_id="r1")

# ② 派活：prompt 的响应只算受理，跑完要等 agent_settled
send({"id": "r2", "type": "prompt",
      "message": "数一数 wc-ext 目录下有几个文件，用 bash 工具执行 ls 验证，然后回答"})
receipt = read_until(want_id="r2")      # 受理回执（disposition）
read_until(want_event="agent_settled")  # 等跑完信号

# ③ 取答案：settled 之后才取得到最终文本
send({"id": "r3", "type": "get_last_assistant_text"})
answer = read_until(want_id="r3")

print("状态：isStreaming =", state["data"].get("isStreaming"))
print("受理：disposition =", receipt["data"].get("disposition"))
print("跑完：agent_settled 已到")
print("答案：", answer["data"]["text"])

proc.stdin.close()   # 收尾：关 stdin 请求有序关闭
proc.wait()
log.close()