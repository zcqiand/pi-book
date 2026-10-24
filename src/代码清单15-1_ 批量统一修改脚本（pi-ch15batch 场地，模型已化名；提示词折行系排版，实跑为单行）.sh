cd X:\pi-playground\pi-ch15batch
for f in notes/*.md; do
  pi --model <轻量档> -p "把 $f 中所有「待办：」开头的行改为「已完成：」开头，
其余内容一字不动，改完保存"
done