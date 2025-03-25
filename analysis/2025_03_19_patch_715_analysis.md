# Build Failure Analysis: 2025_03_19_patch_715

## First error

../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found
   11 | #include "partition_alloc/pointers/raw_ptr_exclusion.h"  // IWYU pragma: export

## Category
Rewriter needs to add necessary includes for the code to compile after rewriting.

## Reason
The rewriter has added `base/containers/span.h` to the file. But this header file transitively includes `base/check.h` -> `base/location.h` -> `base/memory/raw_ptr_exclusion.h`. However, `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc` did not include `base/memory/raw_ptr_exclusion.h`.

## Solution
The rewriter needs to add `base/memory/raw_ptr_exclusion.h` to `testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc` to make the code compile.

```diff
--- a/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc
+++ b/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc
@@ -2,6 +2,7 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/memory/raw_ptr_exclusion.h"
 #include "base/containers/span.h"

 #ifdef UNSAFE_BUFFERS_BUILD