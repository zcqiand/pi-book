// rank.js（修复前）
function sortScores(scores) {
  scores.sort((a, b) => a - b);        // bug1: 原地排序污染调用方数组
  return scores;
}
function topN(scores, n) {
  return scores.slice().sort().slice(-n).reverse();  // bug2: 无比较函数 sort()，字典序陷阱
}