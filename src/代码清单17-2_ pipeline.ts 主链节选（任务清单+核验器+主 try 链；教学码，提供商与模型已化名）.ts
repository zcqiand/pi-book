// 自动化体检流水线：单会话三问体检 wc-ext，程序化核验，产出 report.md + issues.md
// 用法：node pipeline.ts [--inject-fail]，--inject-fail 见 17.5（失败分支演示）
import { createAgentSession, ModelRuntime } from "@earendil-works/pi-coding-agent";
import { writeFileSync } from "node:fs";

const injectFail = process.argv.includes("--inject-fail");

interface Check {
  id: string;
  title: string;
  prompt: string;
  expect: string[]; // 答案必须命中的全部关键词
}

const CHECKS: Check[] = [
  {
    id: "step-1",
    title: "包名与用途描述一致性（package.json ↔ README.md）",
    prompt:
      "读一下 wc-ext/package.json 和 wc-ext/README.md，对比两处：包名是否一致？用途描述是否一致？" +
      "报告你的对比过程，然后在回答最后单独一行给出结论，格式固定为：体检结论：一致 或 体检结论：不一致",
    expect: ["pi-wc-ext", "体检结论：一致"],
  },
  // step-2（CHANGELOG 版本记录规范性）与 step-3（README 用法与代码一致性）同构，条目从略：
  // 差异只在提示词与 expect 关键词（step-2 查新版本在上与改动说明，step-3 查 /wc 与 word_count）
];

// 故障注入（--inject-fail）：向 step-1 追加必不命中关键词，制造核验 FAIL
if (injectFail) {
  CHECKS[0].expect.push("INJECTED-IMPOSSIBLE-KEYWORD-§404§");
}

// 结构断言的正则：结论行存在且合法，全半角冒号都认
const CONCLUSION_RE = /体检结论[:：]\s*(一致|不一致)/;

// 核验器：结构断言 → 判定值 → 关键词断言（全命中才算过）
function verify(answer: string, check: Check): { pass: boolean; reason: string } {
  const m = answer.match(CONCLUSION_RE);
  if (!m) {
    return { pass: false, reason: "结构断言失败：答案缺少「体检结论：一致/不一致」结论行" };
  }
  if (m[1] !== "一致") {
    return { pass: false, reason: "模型判定为「不一致」（疑似发现问题或误报，需人工复核）" };
  }
  const missing = check.expect.filter((k) => !answer.includes(k));
  if (missing.length > 0) {
    return { pass: false, reason: `关键词断言失败：答案缺 ${missing.join("、")}` };
  }
  return { pass: true, reason: "结构断言 + 关键词断言全部命中" };
}

// StepResult 接口（check/answer/pass/reason 四字段）从略
try {
  const modelRuntime = await ModelRuntime.create();
  // 创建段：提供商与模型从全局注册表查得（写你自己的注册名）
  const model = modelRuntime.getModel("<你的提供商>", "<轻量档>");
  if (!model) throw new Error("model not found");
  console.log(`体检模型：${model.provider}/${model.id}`);

  const { session } = await createAgentSession({ model, modelRuntime });

  // 收事件段：订阅回调记账，当运行观测面
  const eventTypes = new Map<string, number>();
  const unsubscribe = session.subscribe((event) => {
    eventTypes.set(event.type, (eventTypes.get(event.type) ?? 0) + 1);
  });

  try {
    const results: StepResult[] = [];
    for (const check of CHECKS) {
      // 交任务段：await 即等待，prompt 整轮跑完才返回，步骤天然串行
      console.log(`\n▶ ${check.id} ${check.title}`);
      await session.prompt(check.prompt);
      // 收结果段：整轮落定取最终答案，立刻核验
      const answer = session.getLastAssistantText() ?? "";
      const v = verify(answer, check);
      results.push({ check, answer, pass: v.pass, reason: v.reason });
      console.log(`  ${v.pass ? "PASS" : "FAIL"} — ${v.reason}`); // FAIL 记账不中断
    }

    const fails = results.filter((r) => !r.pass);
    const healthy = fails.length === 0;

    // ……产出物拼装段从略：report.md（头部四行+逐项结论+答案节选+汇总）与
    //    issues.md（无 FAIL 只写“无”，有 FAIL 逐条原因加节选），两个 writeFileSync 落盘
    console.log(`\n产出物：report.md + issues.md`);
    console.log(`汇总：${healthy ? "全绿" : `有恙（${fails.length} 项 FAIL）`}`);
    console.log("事件类型统计：");
    for (const [t, n] of [...eventTypes.entries()].sort((a, b) => b[1] - a[1])) {
      console.log(`  ${t}  ${n}`);
    }
    process.exitCode = healthy ? 0 : 1; // 退出码协议：0 全过，1 有 FAIL
  } finally {
    unsubscribe();
    session.dispose(); // 清理段：收工必调，finally 兜底
  }
} catch (err) {
  // 会话层兜底：模型或会话异常，打错误、报退出码 2
  console.error(`[pipeline-abort] 流水线异常中断：${err instanceof Error ? (err.stack ?? err.message) : String(err)}`);
  process.exitCode = 2;
}