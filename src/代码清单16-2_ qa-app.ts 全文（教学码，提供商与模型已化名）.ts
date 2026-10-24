// 问答小应用：把 Pi 嵌进 Node 进程，对 wc-ext 目录连问三题并程序化核验
import { createAgentSession, ModelRuntime } from "@earendil-works/pi-coding-agent";

const REPO = "./wc-ext";   // 问答对象：第 14 章写的扩展包（四文件拷入场内）
const EXAM = [
  { q: "这个目录里的包叫什么名字，是干什么用的？", keys: ["pi-wc-ext"] },
  { q: "word_count 工具的统计口径有几种？", keys: ["非空白字符", "中文字符", "行数"] },
  { q: "1.0.1 版改了什么？", keys: ["ENOENT", "友好提示"] },
];

const modelRuntime = await ModelRuntime.create();
// 自定义提供商经 models.json 注册表查得，这里写你自己的提供商与模型名
const model = modelRuntime.getModel("<你的提供商>", "<轻量档>");

const { session } = await createAgentSession({ model, modelRuntime });

const eventCount: Record<string, number> = {};
let toolCalls = 0;
session.subscribe((event) => {            // 订阅事件：回调记账，不落盘
  const t = event.type;
  eventCount[t] = (eventCount[t] ?? 0) + 1;
  if (t === "tool_execution_start") toolCalls++;
});

let pass = 0;
try {
  for (let i = 0; i < EXAM.length; i++) {
    await session.prompt(`在 ${REPO} 目录里回答：${EXAM[i].q}`); // 整轮跑完才返回
    const answer = session.getLastAssistantText();
    const ok = EXAM[i].keys.every((k) => answer.includes(k));
    if (ok) pass++;
    console.log(`Q${i + 1} ${ok ? "PASS" : "FAIL"}：${EXAM[i].q}`);
  }
} finally {
  await session.dispose();                // 收工清理：进程退出前必调
}
console.log(`核验：${pass}/${EXAM.length} 通过；工具调用 ${toolCalls} 次`);
console.log("事件订阅统计：");
for (const [t, n] of Object.entries(eventCount).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${t}\t${n}`);
}