# Build Failure Analysis: 2025_03_19_patch_714

## First error
../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found
   11 | #include "partition_alloc/pointers/raw_ptr_exclusion.h"  // IWYU pragma: export
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The diff shows that the rewriter added `#include "base/containers/span.h"` to `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc`. This header transitively includes `raw_ptr_exclusion.h` which includes system headers that are wrapped in `extern "C" {}`. Because this is a `.cc` file and not a header file, this should not cause any issues.

However, the file that it is complaining about is raw_ptr_exclusion.h, which means that this file is probably being included in a header that is not supposed to include it. Let's examine the code.

```c++
  uint16_t* p_src_u_16 =
  base::span<uint16_t> p_src_u_16 =
       reinterpret_cast<uint16_t*>(malloc(src_uv_plane_size * 2));
```

The line above is problematic because the rewriter changed `uint16_t*` to `base::span<uint16_t>`, so the rewriter added `#include "base/containers/span.h"` in `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc`. This include transitively includes `base/memory/raw_ptr_exclusion.h`, which then includes `<string.h>` which are wrapped with `extern "C" {}`. The problem is that the rewriter is including this header file in a non-header file.

The rewriter shouldn't be adding this header inside a C++ class declaration. But `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc` isn't a header file so this category doesn't apply.

The rewriter failed to add `.data()` when converting a `uint16_t*` to `base::span<uint16_t>`. Because it forgot to add `.data()` the compiler couldn't compile it and gave a seemingly unrelated error. This is more likely the root cause.

## Solution
The rewriter needs to add `.data()` when assigning the malloc'd pointer to the span.

```diff
 uint16_t* p_src_u_16 =
+ base::span<uint16_t> p_src_u_16 =
+      reinterpret_cast<uint16_t*>(malloc(src_uv_plane_size * 2)).data();
```

## Note
The error message is misleading because it doesn't point to the root cause of the error. The root cause is that the rewriter didn't add `.data()` which resulted in a type mismatch.