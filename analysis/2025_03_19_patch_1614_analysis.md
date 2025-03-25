```
# Build Failure Analysis: 1

## First error

../../chrome/common/profiler/thread_profiler_configuration.cc:209:36: error: no viable conversion from 'const ThreadProfilerConfiguration::Variation *' to 'base::span<const Variation>'

## Category
Rewriter needs to use iterators when iterating through collections with base::span.

## Reason
The rewriter replaced the raw pointer iterator with a `base::span`, but failed to update the loop condition. `variations.begin()` returns an iterator but `last_item` is a raw pointer. `base::span` does not support implicit conversion from raw pointer. The comparison `it != last_item` is now invalid and the loop increment `++it` is invalid as well. This is because span does not support pointer arithmetic.

## Solution
The rewriter needs to replace the pointer arithmetic with iterators.

The original code

```c++
const Variation* last_item = variations.end() - 1;
for (const Variation* it = variations.begin(); it != last_item; ++it) {
```

should be replaced with

```c++
for (auto it = variations.begin(); it != variations.end() - 1; ++it) {
```

## Note
It might be better to rewrite the for loop with a ranged for loop instead.
```c++
for (const Variation& it : variations) {
```
This removes all iterator handling.