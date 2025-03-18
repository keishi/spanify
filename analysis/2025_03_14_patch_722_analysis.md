# Build Failure Analysis: 2025_03_14_patch_722

## First error

../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The spanify tool added `#include "base/containers/span.h"` in `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc`. But this header transitively includes system headers which are wrapped with `extern "C" {}`. This is invalid C++ syntax inside a class definition. More specifically, span.h transitively includes base/check.h, which transitively includes raw_ptr_exclusion.h. This exclusion header isn't designed to be included in all translation units and causes include ordering issues.

## Solution
The rewriter should avoid including `base/containers/span.h` directly in source files. Rather, it should use forward declarations and include the header only in the implementation file where the span is actually used. In this case, move `#include "base/containers/span.h"` inside the `Scale` function where `base::span` is used. Or, even better, remove the include and cast the allocated memory to `base::span` at the definition location, that way the implementation details does not leak to other files.

## Note
There are a couple of other errors that result from this same root cause.

```
../../testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:61:3: error: C++ requires a type specifier for all declarations
  base::span<uint16_t> p_src_u_16 =
  ^

../../testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:137:17: error: invalid use of incomplete type 'struct base::span<uint16_t>'
  free(p_src_u_16.data());