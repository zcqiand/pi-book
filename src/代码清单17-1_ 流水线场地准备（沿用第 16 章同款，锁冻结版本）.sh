cd X:\pi-playground\pi-ch17pipe
npm init -y
# package.json 手改一行："type": "module"（少这行，.ts 里的 import 直接 SyntaxError）
npm install @earendil-works/pi-coding-agent@1.0.2
node -v
# v24.14.1（原生直跑 .ts，零额外参数）