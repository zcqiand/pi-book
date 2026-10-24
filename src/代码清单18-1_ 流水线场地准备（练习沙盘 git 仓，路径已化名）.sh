cd X:\pi-playground\pi-ch18demo
git log --oneline
# 4f4fbb7 feat: 满100折扣
# 6587175 init: 求和工具
git diff main...feat/discount --stat
# shop.py、README.md 两文件，合计 8 处新增、1 处删除
git diff main...feat/discount
# 实测 24 行：shop.py 新增 apply_discount(total, percent) 与 README 同步说明