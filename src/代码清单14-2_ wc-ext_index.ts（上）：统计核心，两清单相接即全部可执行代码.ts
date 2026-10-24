import { Type } from "@earendil-works/pi-ai";
import { defineTool, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { readFileSync } from "node:fs";

interface WcResult {
  chars: number;
  cjk: number;
  lines: number;
}

function countWords(filePath: string): WcResult {
  const text = readFileSync(filePath, "utf-8");
  const lines = text.split(/\r?\n/);
  const kept: string[] = [];
  let inFence = false;
  for (const line of lines) {
    if (line.trimStart().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (!inFence) kept.push(line);
  }
  const body = kept.join("\n");
  const chars = body.replace(/\s+/g, "").length;
  const cjk = (body.match(/[一-鿿]/g) ?? []).length;
  return { chars, cjk, lines: kept.length };
}