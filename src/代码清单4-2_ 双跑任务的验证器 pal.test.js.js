const pal = require('./pal.js');

const cases = [
  [pal.isPalindrome, 'A man, a plan, a canal: Panama', true],
  [pal.isPalindrome, "No 'x' in Nixon", true],
  [pal.isPalindrome, 'Hello', false],
  [pal.reverseWords, '  the   quick  fox ', 'fox quick the'],
  [pal.reverseWords, 'one', 'one'],
];

let failed = 0;
for (const [fn, input, want] of cases) {
  const got = fn(input);
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