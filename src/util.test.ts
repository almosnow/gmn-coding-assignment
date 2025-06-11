import assert, {} from 'node:assert';
import { AFB_x_AS_x_OPT, arrayFillB } from './util.js';

function test() {
  const n = 1000*1000*10;

  // Reference array [1, ..., N]
  const a = arrayFillB(n)();

  // Shuffled array with numbers 1:N
  const b = AFB_x_AS_x_OPT(n)();

  assert.strictEqual(a.length, n, 'Length mismatch on reference array');
  console.log('The length of the reference array is ' + a.length.toLocaleString() + '                  ✅');

  assert.strictEqual(b.length, n, 'Length mismatch on shuffled array');
  console.log('The length of the shuffled array is ' + a.length.toLocaleString() + '                   ✅');

  // Sort the shuffled array numerically, should become exactly equal to the reference array
  b.sort((_a, _b) => _a-_b);

  assert.ok(
    (() => {
      for(let i=0;i<a.length;++i)
        if(a[i] !== b[i])
          return false;

      return true;
    })(),
    'The reference and shuffled array contain a different set of numbers'
  );

  console.log('The reference and shuffled array contain the same set of numbers ✅');

  console.log();
  console.log('All tests OK                                                     ✅');
};

test();
