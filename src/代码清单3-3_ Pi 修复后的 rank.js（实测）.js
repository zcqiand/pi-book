function sortScores(scores) {
  return scores.slice().sort((a, b) => a - b);      // slice 复制，不再污染入参
}
function topN(scores, n) {
  return scores.slice().sort((a, b) => b - a).slice(0, n);  // 数字降序直接取前 n
}