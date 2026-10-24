cd X:\pi-playground\pi-ch16sdk
npm init -y
npm install @earendil-works/pi-coding-agent@1.0.2
# 首跑教训：package.json 里少一行 "type": "module" 的话，.ts 里的 import 直接 SyntaxError
# 第 14 章扩展包的 package.json 里那个同款键，干的就是这件事
node -v
# v24.14.1（原生直跑 .ts，零额外参数）