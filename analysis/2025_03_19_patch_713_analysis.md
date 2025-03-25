# Build Failure Analysis: 2025_03_19_patch_713

## First error

../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found

## Category
Rewriter is including headers that are not available.

## Reason
The rewriter added `#include "base/containers/span.h"` to `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc`.
`base/containers/span.h` transitively includes `base/memory/raw_ptr_exclusion.h`, which is not available from the directory the file is being compiled in. The include paths do not include `base`.

## Solution
The rewriter should not include `base/containers/span.h` unless absolutely necessary, to avoid transitive dependencies. It can also add the include paths to the source file.

## Note