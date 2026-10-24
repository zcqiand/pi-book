# 基线：schema 未改时跑生成（动笔前实测）
npm run db:generate
# No schema changes, nothing to migrate

# 版本画面（lockfile 与实装双证，截至冻结 tag）
# drizzle-orm 0.36.4 / drizzle-kit 0.28.1 / postgres 3.4.9（客户端仓）
npx tsc --version
# Version 5.9.3

# 执行：db:migrate 打向隔离库
npm run db:migrate
# [migrate-db] DATABASE_URL = postgresql://postgres:***@10.x.x.x:5432/chapter22_sandbox
# [migrate-db] extension uuid-ossp OK
# [✓] migrations applied successfully!
# [migrate-db] OK