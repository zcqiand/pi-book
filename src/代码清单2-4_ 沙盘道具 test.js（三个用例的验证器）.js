const slugify = require('./bug.js');

const cases = [
  ['Hello World', 'hello-world'],
  ['  AI 101 !', 'ai-101'],
  ['edge case ', 'edge-case'],
];

let failed = 0;
for (const [input, want] of cases) {
  const got = slugify(input);
  if (got !== want) {
    failed = failed + 1;
    console.log('FAIL ' + JSON.stringify(input) + ': got ' + JSON.stringify(got) + ', want ' + JSON.stringify(want));
  }
}

if (failed > 0) {
  console.log(failed + ' failed');
  process.exitCode = 1;
} else {
  console.log('ALL PASS');
}