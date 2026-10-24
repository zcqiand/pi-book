git worktree add X:\pi-playground\pi-shared-contract -b book/xr-know-017-slices v0.3.10-20261004
# Preparing worktree (new branch 'book/xr-know-017-slices')
# HEAD is now at cb2182b

npm ci
# added 328 packages in 13s

# 基线一：一行未改，先编译契约
npm run emit:openapi
# [emit-openapi] OK
# [emit-fuzz] injected x-fuzz on 1 paths, 0 missing
# EXIT_CODE=0
git diff generated/openapi/openapi.yaml        # 0 行

# 基线二：一行未改，先生成客户端并 prettier 收形（客户端仓工作区内）
npx orval
# orval v7.21.0（横幅余文略）
# saas: Cleaning output folder
# EXIT_CODE=0
git diff                                       # 0 行

# 基线三：类型闸
npx tsc --version
# Version 5.9.3
npx tsc --noEmit                               # exit 0