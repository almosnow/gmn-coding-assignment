import {
  AFB_x_AS,
  AFB_x_AS_x_OPT,
  AFB_x_AS_x_OPT_x_NO_INIT,
  AFIR_x_SORT,
  arrayFillA,
  arrayFillB,
  arrayFillIndexRandom,
  arrayFillRandom,
  arrayFillZero,
  arrayShuffle,
  arraySort,
  BucketRadixShuffle,
  measure,
  randomMath,
  randomMulberry32,
  randomXORshift128
} from './util.js';

console.log();
console.log('    **** 1M numbers ****');
console.log();

await measure({ f:arrayFillA(1000*1000), n:1000*1000, name:'arrayFillA   [1M]' });
await measure({ f:arrayFillB(1000*1000), n:1000*1000, name:'arrayFillB   [1M]' });

await measure({ f:randomMath(1000*1000), n:1000*1000, name:'randomMath   [1M]' });
await measure({ f:randomMulberry32(1000*1000), n:1000*1000, name:'randomMulberry32   [1M]' });
await measure({ f:randomXORshift128(1000*1000), n:1000*1000, name:'randomXORshift128   [1M]' });

await measure({ f:arrayFillRandom(1000*1000), n:1000*1000, name:'arrayFillRandom   [1M]' });
await measure({ f:arrayFillIndexRandom(1000*1000), n:1000*1000, name:'arrayFillIndexRandom   [1M]' });

const ArrayInteger1M = arrayFillB(1000*1000)();
await measure({ f:arrayShuffle(ArrayInteger1M), n:1000*1000, name:'arrayShuffle   [1M]' });

await measure({ f:AFB_x_AS(1000*1000), n:1000*1000, name:'AFB_x_AS   [1M]' });
await measure({ f:AFB_x_AS_x_OPT(1000*1000), n:1000*1000, name:'AFB_x_AS_x_OPT   [1M]' });
await measure({ f:AFB_x_AS_x_OPT_x_NO_INIT(1000*1000), n:1000*1000, name:'AFB_x_AS_x_OPT_x_NO_INIT   [1M]' });

const ArrayInteger1MShuffled = arrayShuffle(arrayFillB(1000*1000)())();
await measure({ f:arraySort(ArrayInteger1MShuffled), n:1000*1000, name:'arraySort   [1M]' });

await measure({ f:AFIR_x_SORT(1000*1000), n:1000*1000, name:'AFIR_x_SORT   [1M]' });

await measure({ f:arrayFillZero(1000*1000), n:1000*1000, name:'arrayFillZero   [1M]' });

const ArrayMemory1Mx1 = arrayFillZero(1000*1000*1)();
await measure({ f:BucketRadixShuffle(ArrayMemory1Mx1, 1000*1000), n:1000*1000, name:'BucketRadixShuffle (Mx1)   [1M]' });

const ArrayMemory1Mx2 = arrayFillZero(1000*1000*2)();
await measure({ f:BucketRadixShuffle(ArrayMemory1Mx2, 1000*1000), n:1000*1000, name:'BucketRadixShuffle (Mx2)   [1M]' });

const ArrayMemory1Mx4 = arrayFillZero(1000*1000*4)();
await measure({ f:BucketRadixShuffle(ArrayMemory1Mx4, 1000*1000), n:1000*1000, name:'BucketRadixShuffle (Mx4)   [1M]' });

console.log();
console.log('    **** 10M numbers ****');
console.log();

await measure({ f:arrayFillA(1000*1000*10), n:1000*1000*10, name:'arrayFillA  [10M]' });
await measure({ f:arrayFillB(1000*1000*10), n:1000*1000*10, name:'arrayFillB  [10M]' });

await measure({ f:randomMath(1000*1000*10), n:1000*1000*10, name:'randomMath  [10M]' });
await measure({ f:randomMulberry32(1000*1000*10), n:1000*1000*10, name:'randomMulberry32  [10M]' });
await measure({ f:randomXORshift128(1000*1000*10), n:1000*1000*10, name:'randomXORshift128  [10M]' });

await measure({ f:arrayFillRandom(1000*1000*10), n:1000*1000*10, name:'arrayFillRandom  [10M]' });
await measure({ f:arrayFillIndexRandom(1000*1000*10), n:1000*1000*10, name:'arrayFillIndexRandom  [10M]' });

const ArrayInteger10M = arrayFillB(1000*1000*10)();
await measure({ f:arrayShuffle(ArrayInteger10M), n:1000*1000*10, name:'arrayShuffle  [10M]' });

await measure({ f:AFB_x_AS(1000*1000*10), n:1000*1000*10, name:'AFB_x_AS  [10M]' });
await measure({ f:AFB_x_AS_x_OPT(1000*1000*10), n:1000*1000*10, name:'AFB_x_AS_x_OPT  [10M]' });
await measure({ f:AFB_x_AS_x_OPT_x_NO_INIT(1000*1000*10), n:1000*1000*10, name:'AFB_x_AS_x_OPT_x_NO_INIT  [10M]' });

const ArrayInteger10MShuffled = arrayShuffle(arrayFillB(1000*1000*10)())();
await measure({ f:arraySort(ArrayInteger10MShuffled), n:1000*1000*10, name:'arraySort  [10M]' });

await measure({ f:AFIR_x_SORT(1000*1000*10), n:1000*1000*10, name:'AFIR_x_SORT  [10M]' });

await measure({ f:arrayFillZero(1000*1000*10), n:1000*1000*10, name:'arrayFillZero  [10M]' });

const ArrayMemory10Mx1 = arrayFillZero(1000*1000*10*1)();
await measure({ f:BucketRadixShuffle(ArrayMemory10Mx1, 1000*1000*10), n:1000*1000*10, name:'BucketRadixShuffle (Mx1)  [10M]' });

const ArrayMemory10Mx2 = arrayFillZero(1000*1000*10*2)();
await measure({ f:BucketRadixShuffle(ArrayMemory10Mx2, 1000*1000*10), n:1000*1000*10, name:'BucketRadixShuffle (Mx2)  [10M]' });

const ArrayMemory10Mx4 = arrayFillZero(1000*1000*10*4)();
await measure({ f:BucketRadixShuffle(ArrayMemory10Mx4, 1000*1000*10), n:1000*1000*10, name:'BucketRadixShuffle (Mx4)  [10M]' });

console.log();
console.log('    **** 100M numbers ****');
console.log();

await measure({ f:arrayFillA(1000*1000*100), n:1000*1000*100, name:'arrayFillA [100M]' });
await measure({ f:arrayFillB(1000*1000*100), n:1000*1000*100, name:'arrayFillB [100M]' });

await measure({ f:randomMath(1000*1000*100), n:1000*1000*100, name:'randomMath [100M]' });
await measure({ f:randomMulberry32(1000*1000*100), n:1000*1000*100, name:'randomMulberry32 [100M]' });
await measure({ f:randomXORshift128(1000*1000*100), n:1000*1000*100, name:'randomXORshift128 [100M]' });

await measure({ f:arrayFillRandom(1000*1000*100), n:1000*1000*100, name:'arrayFillRandom [100M]' });
// await measure({ f:arrayFillIndexRandom(1000*1000*100), n:1000*1000*100, name:'arrayFillIndexRandom [100M]' });
// ^^^^ FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

const ArrayInteger100M = arrayFillB(1000*1000*100)();
await measure({ f:arrayShuffle(ArrayInteger100M), n:1000*1000*100, name:'arrayShuffle [100M]' });

await measure({ f:AFB_x_AS(1000*1000*100), n:1000*1000*100, name:'AFB_x_AS [100M]' });
await measure({ f:AFB_x_AS_x_OPT(1000*1000*100), n:1000*1000*100, name:'AFB_x_AS_x_OPT [100M]' });
await measure({ f:AFB_x_AS_x_OPT_x_NO_INIT(1000*1000*100), n:1000*1000*100, name:'AFB_x_AS_x_OPT_x_NO_INIT [100M]' });

const ArrayInteger100MShuffled = arrayShuffle(arrayFillB(1000*1000*100)())();
await measure({ f:arraySort(ArrayInteger100MShuffled), n:1000*1000*100, name:'arraySort [100M]' });

// await measure({ f:AFIR_x_SORT(1000*1000*100), n:1000*1000*100, name:'AFIR_x_SORT [100M]' });
// ^^^^ FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory

await measure({ f:arrayFillZero(1000*1000*100), n:1000*1000*100, name:'arrayFillZero [100M]' });

// const ArrayMemory100Mx1 = arrayFillZero(1000*1000*100*1)();
// await measure({ f:BucketRadixShuffle(ArrayMemory100Mx1, 1000*1000*100), n:1000*1000*100, name:'BucketRadixShuffle (Mx1) [100M]' });
// ^^^^ FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory

// const ArrayMemory100Mx2 = arrayFillZero(1000*1000*100*2)();
// ^^^^ RangeError: Invalid array length
// await measure({ f:BucketRadixShuffle(ArrayMemory100Mx2, 1000*1000*100), n:1000*1000*100, name:'BucketRadixShuffle (Mx2) [100M]' });

// const ArrayMemory100Mx4 = arrayFillZero(1000*1000*100*4)();
// ^^^^ RangeError: Invalid array length
// await measure({ f:BucketRadixShuffle(ArrayMemory100Mx4, 1000*1000*100), n:1000*1000*100, name:'BucketRadixShuffle (Mx4) [100M]' });
