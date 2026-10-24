function format(file: string, r: WcResult): string {
  return `${file}：非空白字符 ${r.chars}，中文 ${r.cjk}，行数 ${r.lines}`;
}

const wordCountTool = defineTool({
  name: "word_count",
  label: "字数统计",
  description:
    "统计 markdown 文件的字数（自动剥除 ``` 围栏代码块后计算）。返回：非空白字符数、中文字符数、行数。",
  parameters: Type.Object({
    path: Type.String({ description: "要统计的文件路径" }),
  }),
  async execute(_toolCallId, params) {
    const r = countWords(params.path);
    return {
      content: [{ type: "text", text: format(params.path, r) }],
      details: r,
    };
  },
});

export default function (pi: ExtensionAPI) {
  pi.registerTool(wordCountTool);
  pi.registerCommand("wc", {
    description: "统计 markdown 文件字数（剥代码块）：/wc <文件路径>",
    handler: async (args, ctx) => {
      const file = args.trim();
      if (!file) {
        ctx.ui.notify("用法：/wc <文件路径>", "warning");
        return;
      }
      try {
        const r = countWords(file);
        ctx.ui.notify(format(file, r), "info");
      } catch (e) {
        ctx.ui.notify(`读取失败：${String(e)}`, "error");
      }
    },
  });
}