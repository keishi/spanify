# Build Failure Analysis: 2025_05_02_patch_24

## First error

../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found
   11 | #include "partition_alloc/pointers/raw_ptr_exclusion.h"  // IWYU pragma: export
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The rewriter added `#include "base/containers/span.h"` in `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc`. But this header transitively includes `base/check.h` -> `base/location.h` -> `base/memory/raw_ptr_exclusion.h` which includes `partition_alloc/pointers/raw_ptr_exclusion.h`. The `partition_alloc` headers are not supposed to be included directly.

## Solution
The rewriter should not include `base/containers/span.h` in files that are not supposed to include it directly.

## Note