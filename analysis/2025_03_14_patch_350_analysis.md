# Build Failure Analysis: 2025_03_14_patch_350

## First error

../../third_party/blink/renderer/platform/fonts/simple_font_data.cc:473:39: error: no viable overloaded '='
  473 |     UNSAFE_TODO(han_kerning_cache_[i] = std::move(han_kerning_cache_[i - 1]));
      |                 ~~~~~~~~~~~~~~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to support member field assignment on `std::array` variables.

## Reason
The code tries to assign a new value to a field within an element of `std::array`, but the assignment operator of the structure `HanKerningCacheEntry` is not const. Since the `han_kerning_cache_` member is const qualified, the assignment fails. The rewriter modified the type of `han_kerning_cache_` from a C-style array to a `std::array`, but did not account for the const qualification during the assignment.

## Solution
The rewriter should ensure member field assignments on `std::array` variables that have `const` fields are valid. Mark the assignment function of `HanKerningCacheEntry` as const to fix this issue. Or, remove const qualification of `han_kerning_cache_`.

Since code changes can't be made directly, an alternative is to iterate on `std::array` with a non const reference value.

```c++
  for(auto& cache_entry : han_kerning_cache_) {
    UNSAFE_TODO(cache_entry = std::move(cache_entry));
  }
```

## Note
The original code contains a `mutable HanKerningCacheEntry han_kerning_cache_[2];` line which was rewritten into `std::array<HanKerningCacheEntry, 2> han_kerning_cache_;`. Mutability was lost after rewriting, because the rewritten type, `std::array`, does not automatically imply field mutability when the array itself is mutable. Also, the rewriter added `#include <array>` which might not be necessary because the including file already contains the `#include <array>`.