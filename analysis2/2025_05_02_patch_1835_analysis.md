```
# Build Failure: 2025_05_02_patch_1835

## Chromium Revision

`a3ffac36a0fd4cbdc95cd5ec879816b9634a1d56`

## Code Changes (Diff)

```diff
diff --git a/components/gwp_asan/client/guarded_page_allocator.cc b/components/gwp_asan/client/guarded_page_allocator.cc
index 727b82493cca8..7ff02b250f88d 100644
--- a/components/gwp_asan/client/guarded_page_allocator.cc
+++ b/components/gwp_asan/client/guarded_page_allocator.cc
@@ -2,6 +2,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/containers/span.h"
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/40285824): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -461,7 +463,9 @@ void GuardedPageAllocator::RecordAllocationMetadata(
   metadata_[metadata_idx].alloc.trace_len =
       Pack(reinterpret_cast<uintptr_t*>(trace), len,
            metadata_[metadata_idx].stack_trace_pool,
-           sizeof(metadata_[metadata_idx].stack_trace_pool) / 2);
+           (stack_trace_pool.size() *
+            sizeof(decltype(stack_trace_pool)::value_type)) /
+               2);
   metadata_[metadata_idx].alloc.tid = base::PlatformThread::CurrentId();
   metadata_[metadata_idx].alloc.trace_collected = true;
 
@@ -477,9 +481,10 @@ void GuardedPageAllocator::RecordDeallocationMetadata(
   size_t len = AllocationInfo::GetStackTrace(trace);
   metadata_[metadata_idx].dealloc.trace_len =
       Pack(reinterpret_cast<uintptr_t*>(trace), len,
-           metadata_[metadata_idx].stack_trace_pool +
+           base::span<uint8_t>(metadata_[metadata_idx].stack_trace_pool)
+               .subspan(metadata_[metadata_idx].alloc.trace_len),
+           (stack_trace_pool.size() *
+            sizeof(decltype(stack_trace_pool)::value_type)) -
                metadata_[metadata_idx].alloc.trace_len);
   metadata_[metadata_idx].dealloc.tid = base::PlatformThread::CurrentId();
   metadata_[metadata_idx].dealloc.trace_collected = true;

```

## Build Failure Log

```

14.60s Build Failure: 3 done 1 failed 46526 remaining - 0.21/s
 1 steps failed: exit=1
see ./out/linux/siso_output for full command line and output
 or ./out/linux/siso.INFO
use ./out/linux/siso_failed_commands.sh to re-run failed commands
real	0m14.890s
user	1m38.759s
sys	1m11.063s
ninja: Entering directory `out/linux'
init credentials done 53.249666ms
reapi instance: projects/rbe-chrome-untrusted/instances/default_instance
loading fs state done 1.133423417s
loading/recompacting deps log done 1.75157896s
load siso config done 97.034562ms
load build.ninja done 1.017118265s
schedule pending:0+ready:1 (node:324309 edge:2)
build start: Ready 1 Pending 1
rebuild manifest finished	
schedule pending:0+ready:1 (node:324309 edge:9)
schedule pending:92076+ready:10295 (node:324309 edge:102375)
 1.52s schedule pending:109791+ready:13477 (node:324309 edge:123268)
build start: Ready 13477 Pending 109791
FAILED: e94af235-55f0-4ab8-bc2d-049de5372ca5 "./obj/components/gwp_asan/client/client/guarded_page_allocator.o" CXX obj/components/gwp_asan/client/client/guarded_page_allocator.o
err: exit=1
../../third_party/llvm-build/Release+Asserts/bin/clang++ -MMD -MF obj/components/gwp_asan/client/client/guarded_page_allocator.o.d -DDCHECK_ALWAYS_ON=1 -DUSE_UDEV -DUSE_AURA=1 -DUSE_GLIB=1 -DUSE_OZONE=1 -D__STDC_CONSTANT_MACROS -D__STDC_FORMAT_MACROS -D_FORTIFY_SOURCE=2 -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_GNU_SOURCE -DCR_CLANG_REVISION=\"llvmorg-21-init-9266-g09006611-2\" -D_LIBCPP_HARDENING_MODE=_LIBCPP_HARDENING_MODE_EXTENSIVE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCXXABI_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCPP_INSTRUMENTED_WITH_ASAN=0 -DCR_LIBCXX_REVISION=f034fd5662d033c281ab6a9b45164066ddd18809 -DCR_SYSROOT_KEY=20250129T203412Z-1 -DNDEBUG -DNVALGRIND -DDYNAMIC_ANNOTATIONS_ENABLED=0 -DGWP_ASAN_IMPLEMENTATION -DGLIB_VERSION_MAX_ALLOWED=GLIB_VERSION_2_56 -DGLIB_VERSION_MIN_REQUIRED=GLIB_VERSION_2_56 -DCRASHPAD_ZLIB_SOURCE_EXTERNAL -I../.. -Igen -I../../buildtools/third_party/libc++ -I../../third_party/perfetto/include -Igen/third_party/perfetto/build_config -Igen/third_party/perfetto -I../../base/allocator/partition_allocator/src -Igen/base/allocator/partition_allocator/src -I../../third_party/abseil-cpp -I../../third_party/boringssl/src/include -I../../third_party/protobuf/src -I../../third_party/crashpad/crashpad -I../../third_party/crashpad/crashpad/compat/linux -I../../third_party/crashpad/crashpad/compat/non_win -I../../third_party/zlib -Wall -Wextra -Wimplicit-fallthrough -Wextra-semi -Wunreachable-code-aggressive -Wthread-safety -Wgnu -Wno-gnu-anonymous-struct -Wno-gnu-conditional-omitted-operand -Wno-gnu-include-next -Wno-gnu-label-as-value -Wno-gnu-redeclared-enum -Wno-gnu-statement-expression -Wno-gnu-zero-variadic-macro-arguments -Wno-zero-length-array -Wno-missing-field-initializers -Wno-unused-parameter -Wno-psabi -Wloop-analysis -Wno-unneeded-internal-declaration -Wno-cast-function-type -Wno-thread-safety-reference-return -Wno-nontrivial-memcall -Wshadow -Werror -fno-delete-null-pointer-checks -fno-strict-overflow -fno-ident -fno-strict-aliasing -fstack-protector -funwind-tables -fPIC -pthread -fcolor-diagnostics -fmerge-all-constants -fno-sized-deallocation -fcrash-diagnostics-dir=../../tools/clang/crashreports -mllvm -instcombine-lower-dbg-declare=0 -mllvm -split-threshold-for-reg-with-hint=0 -ffp-contract=off -Wa,--crel,--allow-experimental-crel -fextend-variable-liveness=none -fcomplete-member-pointers -m64 -msse3 -Wno-builtin-macro-redefined -D__DATE__= -D__TIME__= -D__TIMESTAMP__= -ffile-compilation-dir=. -no-canonical-prefixes -Xclang --warning-suppression-mappings=../../build/config/warning_suppression.txt -ftrivial-auto-var-init=pattern -O2 -fdata-sections -ffunction-sections -fno-unique-section-names -fno-math-errno -fno-omit-frame-pointer -g0 -fvisibility=hidden -Wheader-hygiene -Wstring-conversion -Wtautological-overlap-compare -Wexit-time-destructors -Wglobal-constructors -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/glib-2.0 -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/lib/x86_64-linux-gnu/glib-2.0/include -Wno-invalid-offsetof -Wenum-compare-conditional -Wno-nullability-completeness -std=c++20 -Wno-trigraphs -gsimple-template-names -fno-exceptions -fno-rtti -nostdinc++ -isystem../../third_party/libc++/src/include -isystem../../third_party/libc++abi/src/include --sysroot=../../build/linux/debian_bullseye_amd64-sysroot -fvisibility-inlines-hidden  -c ../../components/gwp_asan/client/guarded_page_allocator.cc -o obj/components/gwp_asan/client/client/guarded_page_allocator.o
build step: cxx "./obj/components/gwp_asan/client/client/guarded_page_allocator.o"
siso_rule: clang/cxx
stderr:
../../components/gwp_asan/client/guarded_page_allocator.cc:466:13: error: use of undeclared identifier 'stack_trace_pool'
  466 |            (stack_trace_pool.size() *
      |             ^~~~~~~~~~~~~~~~
../../components/gwp_asan/client/guarded_page_allocator.cc:467:29: error: use of undeclared identifier 'stack_trace_pool'; did you mean 'AllocatorState::SlotMetadata::stack_trace_pool'?
  467 |             sizeof(decltype(stack_trace_pool)::value_type)) /
      |                             ^~~~~~~~~~~~~~~~
      |                             AllocatorState::SlotMetadata::stack_trace_pool
../../components/gwp_asan/common/allocator_state.h:107:48: note: 'AllocatorState::SlotMetadata::stack_trace_pool' declared here
  107 |     std::array<uint8_t, kMaxPackedTraceLength> stack_trace_pool;
      |                                                ^
../../components/gwp_asan/client/guarded_page_allocator.cc:486:13: error: use of undeclared identifier 'stack_trace_pool'
  486 |            (stack_trace_pool.size() *
      |             ^~~~~~~~~~~~~~~~
../../components/gwp_asan/client/guarded_page_allocator.cc:487:29: error: use of undeclared identifier 'stack_trace_pool'; did you mean 'AllocatorState::SlotMetadata::stack_trace_pool'?
  487 |             sizeof(decltype(stack_trace_pool)::value_type)) -
      |                             ^~~~~~~~~~~~~~~~
      |                             AllocatorState::SlotMetadata::stack_trace_pool
../../components/gwp_asan/common/allocator_state.h:107:48: note: 'AllocatorState::SlotMetadata::stack_trace_pool' declared here
  107 |     std::array<uint8_t, kMaxPackedTraceLength> stack_trace_pool;
      |                                                ^
4 errors generated.
build failed	
local:3 remote:0 cache:0 fallback:0 retry:0 skip:76739
reapi: ops: 62(err:31) / r:0(err:0) 0B / w:66(err:3) 61.23KiB
fs: ops: 4273(err:904) / r:1216(err:0) 11.41MiB / w:0(err:0) 0B
```

# Build Failure Analysis: 2025_05_02_patch_1835

## First error

```
../../components/gwp_asan/client/guarded_page_allocator.cc:466:13: error: use of undeclared identifier 'stack_trace_pool'
  466 |            (stack_trace_pool.size() *
      |             ^~~~~~~~~~~~~~~~
```

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter seems to be confused about where the `stack_trace_pool` variable is declared. It seems to think it's in the local scope of `GuardedPageAllocator::RecordAllocationMetadata` whereas in fact it's part of `metadata_[metadata_idx]`. It incorrectly tried to apply arrayification to a variable that was not an array in the current scope, causing it to generate `stack_trace_pool.size()` in a place where `stack_trace_pool` is not defined.

## Solution
The rewriter should not modify any code that does not directly involve spanifying/arrayifying a variable or function. In this case it modified stack_trace_pool which was not a target of rewriting. The rewriter should check if stack_trace_pool has been arrayified before attempting to add `.size()` and similar methods.