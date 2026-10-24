# 合法任务：读在白名单内，原样通过
pi -p --no-session --model <轻量档> -t read "读 miniapp/README.md 的标题行，原样报出来"
# 模型回报：# mini-notes

# 越权任务：读不在话下，写盘越权
pi -p --no-session --model <轻量档> -t read "读 miniapp/README.md，然后把全文写入 cli-out.md"
# 模型交代：不过我目前只有 `read`（读文件）这一个可用工具，没有写入/编辑文件的工具，所以无法直接把内容写入 `cli-out.md`。

# 跑后验尸
ls cli-out.md
# ls: cannot access 'cli-out.md': No such file or directory