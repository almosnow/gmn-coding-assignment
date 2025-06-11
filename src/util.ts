/* Types */

/**
 * Arguments for benchmarking a function using `measure`.
 *
 * @typedef {Object} MeasureArgs
 * @property {Function} f - The function to benchmark.
 * @property {number} n - The number of implied operations when the function runs.
 * @property {string} name - A name for the benchmark.
 */
type MeasureArgs = {
  f:Function;
  n:number;
  name: string;
};

/**
 * A value that can be either a single number or an array of numbers.
 *
 * @typedef {number | number[]} NumberOrNumberArray
 */
type NumberOrNumberArray = number | number[];

/*
  The following are function factories, they return functions that perform
  some work, rather than executing the work directly.
  
  This design allows them
  to be used as input to `measure({ f:... })`, to benchmark their performance.
*/

/**
 * Returns a function that creates an array [1, ..., n].
 * Using the map function when instantiating the array.
 *
 * @param {number} n - The number of elements in the array.
 * @returns {() => number[]} A function that, when called, returns the array.
 */
export function arrayFillA(n:number):() => number[] {
  return () => Array.from({ length:n }, (_, i) => i);
};

/**
 * Returns a function that creates an array [1, ..., n].
 * This method creates the array first and the fills it up with a trivial for loop.
 *
 * @param {number} n - The number of elements in the array.
 * @returns {() => number[]} A function that, when called, returns the array.
 */
export function arrayFillB(n:number):() => number[] {
  return () => {
    const a:number[] = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = i+1;

    return a;
  };
};

/**
 * Returns a function that creates an array of tuples [index, random number].
 * Example:
 * [
 *   [1, Math.random()],
 *   [2, Math.random()],
 *   [...],
 *   [n, Math.random()],
 * ]
 * This method follows the same allocation strategy as `arrayFillB(n)`.
 *
 * @param {number} n - The number of elements in the array.
 * @returns {() => [number, number][]} A function that, when called, returns the array.
 */
export function arrayFillIndexRandom(n:number):() => [number, number][] {
  return () => {
    const a:[number, number][] = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = [i+1, Math.random()];

    return a;
  };
};

/**
 * Returns a function that creates an array filled with random numbers,
 * using `Math.random()`.
 *
 * @param {number} n - The number of elements in the array.
 * @returns {() => number[]} A function that, when called, returns the array.
 */
export function arrayFillRandom(n:number):() => number[] {
  return () => {
    const a:number[] = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = Math.random();

    return a;
  };
};

/**
 * Returns a function that creates an array filled with zeroes.
 *
 * @param {number} n - The number of elements in the array.
 * @returns {() => number[]} A function that, when called, returns the array.
 */
export function arrayFillZero(n:number):() => number[] {
  return () => {
    const a:number[] = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = 0;

    return a;
  };
};

/**
 * Returns a function that shuffles the given array in place,
 * using a variant of the Fisher–Yates algorithm.
 *
 * @template T
 * @param {T[]} a - The array to be shuffled.
 * @returns {() => T[]} A function that, when called, shuffles the array.
 */
export function arrayShuffle<T>(a:T[]):() => T[] {
  return () => {
    for(let i=a.length-1;i>0;--i) {
      const j = Math.floor(Math.random()*(i+1));

      // [a[i], a[j]] = [a[j], a[i]];
      // ^^^^ ES6 destructuring assignment syntax greatly decreases performance!

      let t = a[i];

      a[i] = a[j];
      a[j] = t;
    }

    return a;
  };
};

/**
 * Returns a function that sorts a given array by their numeric values.
 *
 * @template T
 * @param {T[]} a - The array to be sorted.
 * @returns {() => T[]} A function that, when called, returns the sorted array.
 */
export function arraySort<T extends number>(a:T[]):() => T[] {
  return () => a.sort((_a, _b) => _a-_b);
};

/**
 * Returns a function that calls `Math.random()` `n` times when executed.
 *
 * @param {number} n - The number of times to call `Math.random()`.
 * @returns {() => void} A function that, when called, performs the work.
 */
export function randomMath(n:number):() => void {
  return () => {
    for(let i=0;i<n;++i)
      Math.random();
  };
};

/**
 * Returns a function that calls `mulberry32_rand()` `n` times when executed.
 *
 * @param {number} n - The number of times to call `mulberry32_rand()`.
 * @returns {() => void} A function that, when called, performs the work.
 */
export function randomMulberry32(n:number):() => void {
  return () => {
    for(let i=0;i<n;++i)
      mulberry32_rand();
  };
};

/**
 * Returns a function that calls `randomXORShift128()` `n` times when executed.
 *
 * @param {number} n - The number of times to call `randomXORShift128()`.
 * @returns {() => void} A function that, when called, performs the work.
 */
export function randomXORshift128(n:number):() => void {
  return () => {
    for(let i=0;i<n;++i)
      xorshift128_rand();
  };
};

/*
  The following are "compound" functions, functions that borrow the concepts of
  the ones defined above, which is why their names are somewhat unconventional.
  
  The code is written explicitly as opposed to doing function composition because
  the overhead of function calling is significant and we are optimizing for speed.

  They are also meant to be potential solutions to the Shuffle problem.
*/

/**
 * Returns a function that generates a shuffled array of integers from 1 to `n`.
 *
 * AFB_x_AS means:
 * 
 *   * we are filling up the array as in `arrayFillB(n)`
 *   * and we are shuffling it as in `arrayShuffle(a)`
 *
 * @param {number} n - The size of the array and the maximum integer value.
 * @returns {() => number[]} A function that, when called, returns the shuffled array.
 */
export function AFB_x_AS(n:number):() => number[] {
  return () => {
    const a:number[] = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = i+1;

    for(let i=n-1;i>0;--i) {
      const j = Math.floor(Math.random()*(i+1));

      let t = a[i];

      a[i] = a[j];
      a[j] = t;
    }

    return a;
  };
};

/**
 * Returns a function that generates a shuffled array of integers from 1 to `n`.
 *
 * AFB_x_AS_x_OPT means:
 * 
 *   * we do a similar implementation of `AFB_x_AS(n)`
 *   * but using a Uint32Array
 *   * and a much faster random function to increase performance
 *
 * @param {number} n - The size of the array and the maximum integer value.
 * @returns {() => number[]} A function that, when called, returns the shuffled array.
 */
export function AFB_x_AS_x_OPT(n:number):() => Uint32Array {
  return () => {
    const a = new Uint32Array(n);

    for(let i=0;i<n;++i) a[i] = i+1;

    for(let i=n-1;i>0;--i) {
      const j = Math.floor(mulberry32_rand()*(i+1));

      let t = a[i];

      a[i] = a[j];
      a[j] = t;
    }

    return a;
  };
};

/**
 * Returns a function that generates a shuffled array of integers from 1 to `n`.
 *
 * AFB_x_AS_x_OPT_x_NO_INIT means:
 * 
 *   * we do a similar implementation of `AFB_x_AS_x_OPT(n)`
 *   * but we remove the initialization step
 *   * and fill in the values as we iterate through them
 *
 * @param {number} n - The size of the array and the maximum integer value.
 * @returns {() => number[]} A function that, when called, returns the shuffled array.
 */
export function AFB_x_AS_x_OPT_x_NO_INIT(n:number):() => Uint32Array {
  return () => {
    const a = new Uint32Array(n);

    for(let i=n-1;i>0;--i) {
      const j = Math.floor(mulberry32_rand()*(i+1));

      let t = a[i]||(i+1);

      a[i] = a[j]||(j+1);
      a[j] = t;
    }

    return a;
  };
};

/**
 * Returns a function that generates a shuffled array of integers from 1 to `n`.
 *
 * AFIR_x_SORT means:
 * 
 *   * we are filling up the array as in `arrayFillIndexRandom(n)`
 *   * and then we sort it based on the random value in the tuple.
 *
 * @param {number} n - The size of the array and the maximum integer value.
 * @returns {() => [number, number][]} A function that, when called, returns the shuffled array.
 */
export function AFIR_x_SORT(n:number):() => [number, number][] {
  return () => {
    const a:Array<[number, number]> = Array.from({ length:n });

    for(let i=0;i<n;++i)
      a[i] = [Math.random(), i+1];

    a.sort((_a, _b) => _a[0]-_b[0]);

    return a;
  };
};

/**
 * Returns a function that generates a (partially) shuffled array of integers from 1 to `n`,
 * using a hybrid approach inspired by bucketsort and radixsort.
 * 
 * The function requires a pre-allocated "memory" array `m` initialized with zeroes.
 * During execution, it places each integer index into a random position in `m`.
 * If the position is empty (its value is zero), it stores the index directly.
 * If already occupied by a number, it replaces that slot with an array containing
 * both the old and new indexes. If the slot is already an array, it appends the new index.
 *
 * After all indexes have been distributed, the memory array `m` is traversed sequentially,
 * collecting all stored indexes in order, producing the final array.
 *
 * This method relies on the assumption that traversing a linear array is faster than
 * shuffling or sorting, trading memory usage for potential speed gains.
 *
 * **Big issue!** This function does *not* produce a fully random permutation.
 * Multiple indexes placed in the same bucket remain in ascending order,
 * which reduces randomness. This has a trivial fix but it was not developed futher
 * since this approach turned out to be slower than shuffling and it was left as is.
 *
 * @param {NumberOrNumberArray[]} m - Pre-allocated "memory" space to use.
 * @param {number} n - The size of the array and the maximum integer value.
 * @returns {() => number[]} A function that, when called, returns the shuffled array.
 */
export function BucketRadixShuffle(m:NumberOrNumberArray[], n:number):() => number[] {
  return () => {
    for(let i=0;i<n;++i) {
      const r = Math.floor(Math.random()*m.length);

      if(!m[r])
        m[r] = i+1;
      else if(!(m[r] instanceof Array))
        m[r] = [m[r], i+1];
      else
        m[r].push(i+1);
    }

    const a:number[] = [];

    for(let i=0;i<m.length;++i) {
      if(m[i]) {
        if(!Array.isArray(m[1]))
          a.push(m[i] as number);
        else
          for(let j=0;j<(m[i] as number[]).length;++j)
            a.push((m[i] as number[])[j]);
      }
    }

    return a;
  };
};

/*
  Custom PRNG functions
*/

/**
 * Creates a Mulberry32 PRNG function seeded with the given value.
 *
 * The returned function generates a deterministic sequence of pseudo-random numbers
 * between 0 (inclusive) and 1 (exclusive) based on the seed.
 *
 * @param {number} seed - The initial seed value for the PRNG.
 * @returns {() => number} A function that, when called, returns a pseudo-random number.
 */
function mulberry32(seed:number):() => number {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t^t>>>15, t|1);
    t ^= t + Math.imul(t^t>>>7, t|61);

    return ((t^t>>>14)>>>0)/4294967296;
  };
}

/**
 * An instance of the Mulberry32 PRNG seeded with the current timestamp.
 */
const mulberry32_rand:() => number = mulberry32(Date.now());

/**
 * Internal state variables for the xorshift128 PRNG algorithm.
 */
let _w:number = 88675123;
let _x:number = 123456789;
let _y:number = 362436069;
let _z:number = 521288629;

/**
 * Generates a pseudo-random number using the xorshift128 algorithm.
 * 
 * Uses the internal state variables `_w`, `_x`, `_y`, and `_z`.
 * Updates the state on each call and returns a 32-bit unsigned integer.
 *
 * @returns {number} A pseudo-random 32-bit unsigned integer.
 */
function xorshift128_rand():number {
  let t = _x^(_x<<11);
  _x = _y;
  _y = _z;
  _z = _w;

  _w = (_w^(t>>>8)^(_w>>>19)^(t<<13))>>>0;

  return _w;
};

/**
 * Measures the execution time of a synchronous function and logs performance metrics.
 *
 * The function `f` from the `args` object is executed once, and the elapsed time
 * is measured in milliseconds using `performance.now()`.
 * Logs the benchmark name, time taken, and approximate operations per second.
 *
 * @param {MeasureArgs} args - The measurement arguments.
 * @param {Function} args.f - The synchronous function to benchmark.
 * @param {number} args.n - The number of implied operations executed by the function.
 * @param {string} args.name - The name of the benchmark.
 * @returns {void}
 */
export function measure(args:MeasureArgs):void {
  const now = performance.now();

  args.f();

  const ms = performance.now()-now;
  console.warn(
    args.name.padStart(32, ' '),
    (ms.toLocaleString(undefined, { minimumFractionDigits:2, maximumFractionDigits:2 }) + ' ms').padStart(24, ' '),
    ((args.n/ms*1000).toLocaleString(undefined, { maximumFractionDigits:0 }) + ' ops/s').padStart(24, ' ')
  );
};
