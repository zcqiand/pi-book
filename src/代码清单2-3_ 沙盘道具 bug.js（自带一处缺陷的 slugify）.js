// slugify：把标题转成小写、单词以连字符相连的 URL 友好形式
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-/, '');   // bug: 只去头不去尾
}

module.exports = slugify;