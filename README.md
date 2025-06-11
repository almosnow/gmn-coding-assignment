# GMN Coding Assignment

A simple and fast command-line tool that outputs the integers from `1` to `N`,
in random order, and optimized for speed.

## Requirements

* node v22 or later (it may work on earlier ones but I tested it on v22)

## Usage

**Install dependencies (typescript-related)**  

```
npm install
```

**Compile the source code**  
```
npm run build
```

**Run**

```
node dist/index.js N
```

... where `N` is a positive integer.

**Example**

```
node dist/index.js 8
```

**Output**
```
7,4,6,3,8,5,1,2
```

---

## Run Benchmarks

There is a source file ([util.benchmark.ts](src/util.benchmark.ts)) that
measures the execution time of many of the components and code alternatives that
were used to come up with the fastest implementation of this algorithm.

```
npm run benchmark
```

[Benchmark output from a MacBook Pro M1 on June 10, 2025](misc/benchmark.MBP.M1.20250610.txt).

A description of what each of those functions do can be found at [util.ts](src/util.ts).

---

## Run Tests

A small test suite checks that the shuffled arrays contain all the values as it
is expected.

```
npm run test
```

---

## Explanation

The main source file ([index.ts](src/index.ts)) takes a number as an argument
and creates the appropriate shuffled array by calling the `AFB_x_AS_x_OPT`
function.

The unconventional name stands for "**A**rray **F**ill with strategy **B**, then
shuffle (**AS**) it using an ***opt**imized PRNG function". Of course, the name
could be changed to something more memorable, but this naming system helped me
keep track of all the variants I developed and benchmarked, in order to find the
one that performed best among all alternatives.

The code looks like this:

```ts
// n is a positive integer
// mulberry32_rand is implemented elsewhere in util.ts

// allocate a typed array
const a = new Uint32Array(n);

// fill in the array with all the indexes
for(let i=0;i<n;++i) a[i] = i+1;

// shuffle the array using a variant of Fisher-Yates
for(let i=n-1;i>0;--i) {
  // pick a random position
  const j = Math.floor(mulberry32_rand()*(i+1));

  // swap indexes
  let t = a[i];
  a[i] = a[j];
  a[j] = t;
}

return a;
```

This function, as well as all alternative and auxiliary ones can be found
in [util.ts](src/util.ts), where they are thoroughly documented.

So, how did I arrive at the implementation for `AFB_x_AS_x_OPT`?

**First pass `AFB_x_AS`**

The first approach to the problem turned out to be (almost) the most performant
in the end:

* Create an array of integers `[1, ..., N]`
* Shuffle the array in the fastest way (i.e. in place using Fisher-Yates)

Two ways to fill up an array were measured:

* `arrayFillA`, using the map function that comes with `Array.from(...)`

  Like `Array.from({ length:n }, (_, i) => i)`

* `arrayFillB`, using a regular for loop

  Like `for(let i=0;i<n;++i) a[i] = i+1;`

Here they are, measured:

```
arrayFillA  [10M]                298.13 ms         33,542,438 ops/s
arrayFillB  [10M]                276.35 ms         36,186,247 ops/s
```

`arrayFillB` was found to be slightly faster, so that one was selected.
(`[10M]` means an array with 10 million elements was used in the benchmark)

To shuffle the array, a function `arrayShuffle` was implemented.

`AFB_x_AS` is the name of the function where this is implemented; it fills an
array using strategy B, and then shuffles it using `arrayShuffle`.

The code looks like:

```ts
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
```

And it was measured as:

```
AFB_x_AS  [10M]                562.33 ms         17,783,125 ops/s
```

It takes about half a second to create an array with 10 million integers,
shuffled. Not bad.

**Second pass `AFIR_x_SORT`**

I then explored a strategy where the initial array is allocated with a tuple
containing its index within the array and a random number, like:

```
[
   [1, 0.4458...],
   [2, 0.3566...],
   [3, 0.0891...],
   [4, 0.5052...]
]
```

Then, if we sort this array based on its random component, we get a random order
of the original indexes. For example, the array above becomes:

```
[
   [3, 0.0891...],
   [2, 0.3566...],
   [1, 0.4458...],
   [4, 0.5052...]
]
```

We can see how the indexes in the first position are now randomly rearranged.

This implementation can be found under the `AFIR_x_SORT` function.

`AFIR_x_SORT` means it fills the array with an index and a random number (see
`arrayFillIndexRandom`) and then sorts it (see `arraySort`).

The code looks like:

```ts
const a:Array<[number, number]> = Array.from({ length:n });

for(let i=0;i<n;++i)
  a[i] = [Math.random(), i+1];

a.sort((_a, _b) => _a[0]-_b[0]);

return a;
```

And the benchmark came out as follows:

```
arrayFillIndexRandom  [10M]                748.14 ms         13,366,552 ops/s
           arraySort  [10M]              2,386.59 ms          4,190,076 ops/s
         AFIR_x_SORT  [10M]              8,764.83 ms          1,140,923 ops/s

            AFB_x_AS  [10M]                565.03 ms         17,698,118 ops/s
```

We can see that it performs much worse than the alternative from the first pass
(`AFB_x_AS`). Just filling up the initial array (`arrayFillIndexRandom`) adds so
much overhead that it takes longer than `AFB_x_AS`, which does the whole
thing.

Conclusion, discarded 🗑️.

If we think about what's going on here, `AFIR_x_SORT` can never be faster than
`AFB_x_AS` because, asymptotically:

* `AFB_x_AS` spends `O(n)` time allocating the array + `O(n)` to shuffle
shuffle; total is `O(n)`.

* `AFIR_x_SORT` needs to perform a sort, which (in general) has a best-case time
complexity of `O(n log n)`; higher than `O(n)` and thus always slower than
`AFB_x_AS`.

BUT ... under very specific conditions, we can put together sort algorithms
that get much closer to `O(n)` time, examples are [bucketsort](https://en.wikipedia.org/wiki/Bucket_sort)
and [radixsort](https://en.wikipedia.org/wiki/Radix_sort).

So, I had an idea ...

**Third pass `BucketRadixShuffle`**

What if we had _unlimited_ memory? Then, for each index [1-N], we could take a
random number and use it to store that index at some random position in our big
memory space. Once done, we could just traverse this memory space to recover the
indexes, yielding them in a randomized order.

The premise here is that memory traversal is probably faster than allocations
and general-purpose (i.e. comparative) sorting.

This is implemented in the `BucketRadixShuffle` function. Observe
that, in order to use it, one must pre-allocate a big zero-filled array (our
"memory").

The code is a bit more involved, you can find it at [util.ts](src/util.ts).

And here are the results from the benchmark:

```
           arrayFillZero  [10M]                275.01 ms         36,361,703 ops/s

BucketRadixShuffle (Mx1)  [10M]              1,930.70 ms          5,179,464 ops/s
BucketRadixShuffle (Mx2)  [10M]              1,531.70 ms          6,528,684 ops/s
BucketRadixShuffle (Mx4)  [10M]                959.50 ms         10,422,060 ops/s

                AFB_x_AS  [10M]                566.62 ms         17,648,558 ops/s
             AFIR_x_SORT  [10M]              8,747.43 ms          1,143,193 ops/s

```

`Mx1`, `Mx2` and `Mx4` indicate that the memory space is 1x, 2x or 4x the size
of the input array, respectively.

Why does this matter?

We are basically doing some sort of poor hashing job over into our memory
buckets and a lot of collisions are expected. When a collision occurs (i.e. two
indexes map into the same bucket), we allocate an array to store both, and
others that may follow.

The only way to reduce collisions is to increase the size of the memory
space. And fewer collisions mean less array allocations and less overhead. We
see this reflected in the measurements.

In a _truly infinite_ memory space collisions would approach zero ... but it
would also take an _infinite amount of time_ to traverse. The optimal size of
such memory space (balancing collision rate and traversal spped) is left as an
exercise to the reader 🙂.

On the benchmark, we can see that `BucketRadixShuffle` is much faster than
our previous `AFIR_x_SORT` approach, but still about twice as slow than our
first `AFB_x_AS` implementation.

**Fourth pass `AFB_x_AS_OPT`** (spoiler: the good one!)

It is clear that `AFB_x_AS` is the winning strategy, but could it be
optimized? Yes.

I asked ChatGPT (and trust me, up until this point I had not) and it
suggested the following:

* Use a typed array (`Uint32Array`) instead of a generic array.
* Use [xorshift128](https://en.wikipedia.org/wiki/Xorshift) instead of
`Math.random`, as it's supposed to be faster.

I found a JS implementation of xorshift128, adapted it, and tested it by
generating millions of random numbers; because what I do not see I do not
believe 👀.

The results are:

```
       randomMath  [10M]                 60.94 ms        164,091,120 ops/s
randomXORshift128  [10M]                143.07 ms         69,895,041 ops/s
```

What?! Turns out xorshift128 is actually slower. Bummer. But Chat's idea still
had value, maybe there is a PRNG that is faster than `Math.random`.

I found one, [Mulberry32](https://github.com/cprosche/mulberry32) and
measured it:

```
      randomMath  [10M]                 61.27 ms        163,219,892 ops/s
randomMulberry32  [10M]                 48.25 ms        207,271,069 ops/s
```

Great, it seems to perform better than `Math.random`, not dramatically, but
every bit helps.

The function implementing these optimizations is `AFB_x_AS_OPT`.

The code is the one you saw at the beginning of this explanation, and here's what
the benchmark has to say about it:

```
      AFB_x_AS  [10M]                579.59 ms         17,253,541 ops/s
AFB_x_AS_x_OPT  [10M]                214.34 ms         46,654,258 ops/s
```

Very nice! A bit more than 2x the performance of our initial `AFB_x_AS`
function.

**Fifth pass `AFB_x_AS_OPT_x_NO_INIT`**

I had a bit of extra time, so I tried one last optimization. Since all the
values in the array follow an predictable pattern ([1, 2, ... N]), we might not
need to initialize the array at all, just fill in the values as they are needed.

Here's the benchmark:

```
                AFB_x_AS  [10M]                565.76 ms         17,675,281 ops/s
          AFB_x_AS_x_OPT  [10M]                211.97 ms         47,175,393 ops/s
AFB_x_AS_x_OPT_x_NO_INIT  [10M]                285.57 ms         35,017,408 ops/s
```

It's actually slower. Most likely reason is, even though we skip the
initialization, we introduce a couple more comparisons, which mess up
performance gains we may be getting through memory alignment and speculative
execution.

So meh, ..., not worth it.

We stay with the solution found on the fourth pass.

## Thanks

Alex Morales, 2025
