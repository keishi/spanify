# Build Failure: 2025_05_02_patch_27

## Chromium Revision

`a3ffac36a0fd4cbdc95cd5ec879816b9634a1d56`

## Code Changes (Diff)

```diff
diff --git a/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc b/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc
index 78ca9b06cc4e3..6aa48721d955f 100644
--- a/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc
+++ b/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc
@@ -2,6 +2,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/containers/span.h"
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/351564777): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -61,7 +63,7 @@ void Scale(bool is420,
       reinterpret_cast<uint16_t*>(malloc(src_y_plane_size * 2));
   uint16_t* p_src_u_16 =
       reinterpret_cast<uint16_t*>(malloc(src_uv_plane_size * 2));
-  uint16_t* p_src_v_16 =
+  base::span<uint16_t> p_src_v_16 =
       reinterpret_cast<uint16_t*>(malloc(src_uv_plane_size * 2));
 
   std::seed_seq seed(seed_str.begin(), seed_str.end());
@@ -115,9 +117,9 @@ void Scale(bool is420,
               static_cast<libyuv::FilterMode>(filter_num));
 
     I420Scale_16(p_src_y_16, src_stride_y, p_src_u_16, src_stride_uv,
-                 p_src_v_16, src_stride_uv, src_width, src_height, p_dst_y_16,
-                 dst_stride_y, p_dst_u_16, dst_stride_uv, p_dst_v_16,
-                 dst_stride_uv, dst_width, dst_height,
+                 p_src_v_16.data(), src_stride_uv, src_width, src_height,
+                 p_dst_y_16, dst_stride_y, p_dst_u_16, dst_stride_uv,
+                 p_dst_v_16, dst_stride_uv, dst_width, dst_height,
                  static_cast<libyuv::FilterMode>(filter_num));
   } else {
     I444Scale(src_y, src_stride_y, src_u, src_stride_uv, src_v, src_stride_uv,
@@ -126,9 +128,9 @@ void Scale(bool is420,
               static_cast<libyuv::FilterMode>(filter_num));
 
     I444Scale_16(p_src_y_16, src_stride_y, p_src_u_16, src_stride_uv,
-                 p_src_v_16, src_stride_uv, src_width, src_height, p_dst_y_16,
-                 dst_stride_y, p_dst_u_16, dst_stride_uv, p_dst_v_16,
-                 dst_stride_uv, dst_width, dst_height,
+                 p_src_v_16.data(), src_stride_uv, src_width, src_height,
+                 p_dst_y_16, dst_stride_y, p_dst_u_16, dst_stride_uv,
+                 p_dst_v_16, dst_stride_uv, dst_width, dst_height,
                  static_cast<libyuv::FilterMode>(filter_num));
   }
 
@@ -138,7 +140,7 @@ void Scale(bool is420,
 
   free(p_src_y_16);
   free(p_src_u_16);
-  free(p_src_v_16);
+  free(p_src_v_16.data());
 
   free(dst_y_c);
   free(dst_u_c);
```

## Build Failure Log

```

 9.60s Build Failure: 1 done 1 failed 79813 remaining - 0.10/s
 1 steps failed: exit=1
see ./out/linux/siso_output for full command line and output
 or ./out/linux/siso.INFO
use ./out/linux/siso_failed_commands.sh to re-run failed commands
real	0m9.871s
user	1m1.915s
sys	0m25.438s
ninja: Entering directory `out/linux'
init credentials done 52.467994ms
reapi instance: projects/rbe-chrome-untrusted/instances/default_instance
loading fs state done 1.129119924s
loading/recompacting deps log done 1.316096596s
load siso config done 102.165405ms
load build.ninja done 1.200830109s
schedule pending:0+ready:1 (node:324309 edge:2)
build start: Ready 1 Pending 1
rebuild manifest finished	
schedule pending:0+ready:1 (node:324309 edge:9)
schedule pending:91999+ready:10295 (node:324309 edge:102297)
 1.25s schedule pending:109791+ready:13477 (node:324309 edge:123268)
build start: Ready 13477 Pending 109791
FAILED: cdc1fbe3-0921-4466-abb0-81fceab64cba "./obj/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer_common/libyuv_scale_fuzzer.o" CXX obj/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer_common/libyuv_scale_fuzzer.o
err: exit=1
../../third_party/llvm-build/Release+Asserts/bin/clang++ -MMD -MF obj/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer_common/libyuv_scale_fuzzer.o.d -DDCHECK_ALWAYS_ON=1 -DUSE_UDEV -DUSE_AURA=1 -DUSE_GLIB=1 -DUSE_OZONE=1 -D__STDC_CONSTANT_MACROS -D__STDC_FORMAT_MACROS -D_FORTIFY_SOURCE=2 -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_GNU_SOURCE -DCR_CLANG_REVISION=\"llvmorg-21-init-9266-g09006611-2\" -D_LIBCPP_HARDENING_MODE=_LIBCPP_HARDENING_MODE_EXTENSIVE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCXXABI_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCPP_INSTRUMENTED_WITH_ASAN=0 -DCR_LIBCXX_REVISION=f034fd5662d033c281ab6a9b45164066ddd18809 -DCR_SYSROOT_KEY=20250129T203412Z-1 -DNDEBUG -DNVALGRIND -DDYNAMIC_ANNOTATIONS_ENABLED=0 -DCHROMIUM -DLIBYUV_DISABLE_NEON -DLIBYUV_DISABLE_SVE -DLIBYUV_DISABLE_SME -DLIBYUV_DISABLE_LSX -DLIBYUV_DISABLE_LASX -I../.. -Igen -I../../buildtools/third_party/libc++ -I../../third_party/libyuv/include -Wall -Wextra -Wimplicit-fallthrough -Wextra-semi -Wunreachable-code-aggressive -Wthread-safety -Wgnu -Wno-gnu-anonymous-struct -Wno-gnu-conditional-omitted-operand -Wno-gnu-include-next -Wno-gnu-label-as-value -Wno-gnu-redeclared-enum -Wno-gnu-statement-expression -Wno-gnu-zero-variadic-macro-arguments -Wno-zero-length-array -Wno-missing-field-initializers -Wno-unused-parameter -Wno-psabi -Wloop-analysis -Wno-unneeded-internal-declaration -Wno-cast-function-type -Wno-thread-safety-reference-return -Wno-nontrivial-memcall -Wshadow -Werror -fno-delete-null-pointer-checks -fno-strict-overflow -fno-ident -fno-strict-aliasing -fstack-protector -funwind-tables -fPIC -pthread -fcolor-diagnostics -fmerge-all-constants -fno-sized-deallocation -fcrash-diagnostics-dir=../../tools/clang/crashreports -mllvm -instcombine-lower-dbg-declare=0 -mllvm -split-threshold-for-reg-with-hint=0 -ffp-contract=off -Wa,--crel,--allow-experimental-crel -fextend-variable-liveness=none -fcomplete-member-pointers -m64 -msse3 -Wno-builtin-macro-redefined -D__DATE__= -D__TIME__= -D__TIMESTAMP__= -ffile-compilation-dir=. -no-canonical-prefixes -Xclang --warning-suppression-mappings=../../build/config/warning_suppression.txt -ftrivial-auto-var-init=pattern -O2 -fdata-sections -ffunction-sections -fno-unique-section-names -fno-math-errno -fno-omit-frame-pointer -g0 -fvisibility=hidden -Wheader-hygiene -Wstring-conversion -Wtautological-overlap-compare -Wno-invalid-offsetof -Wenum-compare-conditional -Wno-nullability-completeness -std=c++20 -Wno-trigraphs -gsimple-template-names -fno-exceptions -fno-rtti -nostdinc++ -isystem../../third_party/libc++/src/include -isystem../../third_party/libc++abi/src/include --sysroot=../../build/linux/debian_bullseye_amd64-sysroot -fvisibility-inlines-hidden  -c ../../testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc -o obj/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer_common/libyuv_scale_fuzzer.o
build step: cxx "./obj/testing/libfuzzer/fuzzers/libyuv_scale_fuzzer_common/libyuv_scale_fuzzer.o"
siso_rule: clang/cxx
stderr:
In file included from ../../testing/libfuzzer/fuzzers/libyuv_scale_fuzzer.cc:5:
In file included from ../../base/containers/span.h:31:
In file included from ../../base/check.h:15:
In file included from ../../base/location.h:12:
../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found
   11 | #include "partition_alloc/pointers/raw_ptr_exclusion.h"  // IWYU pragma: export
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.
build failed	
local:1 remote:0 cache:0 fallback:0 retry:0 skip:43454
reapi: ops: 17(err:1) / r:0(err:0) 0B / w:0(err:0) 0B
fs: ops: 741(err:29) / r:438(err:0) 3.93MiB / w:0(err:0) 0B
```

# Build Failure Analysis: 2025_05_02_patch_27

## First error

```
../../base/memory/raw_ptr_exclusion.h:11:10: fatal error: 'partition_alloc/pointers/raw_ptr_exclusion.h' file not found
   11 | #include "partition_alloc/pointers/raw_ptr_exclusion.h"  // IWYU pragma: export
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
1 error generated.
```

## Category
Rewriter is including system headers inside a C++ class declaration, leading to syntax errors.

## Reason
The error message indicates that the include path `partition_alloc/pointers/raw_ptr_exclusion.h` could not be found. This is because the rewriter is adding `#include "base/containers/span.h"` which transitively includes system headers like `<string.h>` which are wrapped with `extern "C" {}`. However `raw_ptr_exclusion.h` is not a system header and should be findable. It must be a problem with the include paths of the clang tool.

## Solution
The include paths of the clang tool are likely misconfigured. Since this is a configuration issue, there is nothing to be changed in the rewriter logic.
```