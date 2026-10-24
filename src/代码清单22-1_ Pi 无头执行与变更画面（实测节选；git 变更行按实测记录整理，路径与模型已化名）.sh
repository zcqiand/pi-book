pi -p --no-session --model <轻量档> -t read,bash,ls,find,grep "$(cat pi-ch22-prompt.txt)"
# real 1m6.021s，exit 0（报告 3316B 落档，错误通道 0 字节）

git status --porcelain
# M drizzle/meta/_journal.json
# M src/db/schema.ts
# ?? drizzle/0003_red_polaris.sql
# ?? drizzle/meta/0003_snapshot.json

git diff --stat
# src/db/schema.ts           | 28 ++++++
# drizzle/meta/_journal.json |  7 +