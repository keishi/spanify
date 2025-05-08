# Build Failure: 2025_05_02_patch_874

## Chromium Revision

`a3ffac36a0fd4cbdc95cd5ec879816b9634a1d56`

## Code Changes (Diff)

```diff
diff --git a/sandbox/linux/syscall_broker/broker_process_unittest.cc b/sandbox/linux/syscall_broker/broker_process_unittest.cc
index 6a08ae388ca0e..bff4bd9ab1ed3 100644
--- a/sandbox/linux/syscall_broker/broker_process_unittest.cc
+++ b/sandbox/linux/syscall_broker/broker_process_unittest.cc
@@ -2,6 +2,7 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/containers/span.h"
 
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/351564777): Remove this and convert code to safer constructs.
@@ -612,8 +613,8 @@ SANDBOX_TEST_ALLOW_NOISE(BrokerProcess, MAYBE_RecvMsgDescriptorLeak) {
   LOG(INFO) << "Ensure Android LOG socket is allocated";
 
   // Find the four lowest available file descriptors.
-  int available_fds[4];
-  SANDBOX_ASSERT(0 == pipe(available_fds));
+  std::array<int, 4> available_fds;
+  SANDBOX_ASSERT(0 == pipe(available_fds.data()));
   SANDBOX_ASSERT(0 == pipe(available_fds + 2));
 
   // Save one FD to send to the broker later, and close the others.
@@ -627,8 +628,10 @@ SANDBOX_TEST_ALLOW_NOISE(BrokerProcess, MAYBE_RecvMsgDescriptorLeak) {
   // descriptors a process can have: it only limits the highest value that can
   // be assigned to newly-created descriptors allocated by the process.)
   const rlim_t fd_limit =
-      1 + *std::max_element(available_fds,
-                            available_fds + std::size(available_fds));
+      1 + *std::max_element(available_fds.data(),
+                            base::span<int>(available_fds)
+                                .subspan(std::size(available_fds))
+                                .data());
 
   struct rlimit rlim;
   SANDBOX_ASSERT(0 == getrlimit(RLIMIT_NOFILE, &rlim));
```

## Build Failure Log

```

14.43s Build Failure: 6 done 1 failed 42698 remaining - 0.42/s
 1 steps failed: exit=1
see ./out/linux/siso_output for full command line and output
 or ./out/linux/siso.INFO
use ./out/linux/siso_failed_commands.sh to re-run failed commands
real	0m14.726s
user	1m44.180s
sys	0m47.304s
ninja: Entering directory `out/linux'
init credentials done 53.923046ms
reapi instance: projects/rbe-chrome-untrusted/instances/default_instance
loading fs state done 1.099785919s
loading/recompacting deps log done 1.24386301s
load siso config done 95.934941ms
load build.ninja done 1.318205076s
schedule pending:0+ready:1 (node:324309 edge:2)
build start: Ready 1 Pending 1
rebuild manifest finished	
schedule pending:0+ready:1 (node:324309 edge:9)
schedule pending:93587+ready:10339 (node:324309 edge:103929)
 1.44s schedule pending:109791+ready:13477 (node:324309 edge:123268)
build start: Ready 13477 Pending 109791
FAILED: a6ae7a44-4332-4d39-a774-28219b603de1 "./obj/sandbox/linux/sandbox_linux_unittests_sources/broker_process_unittest.o" CXX obj/sandbox/linux/sandbox_linux_unittests_sources/broker_process_unittest.o
err: exit=1
../../third_party/llvm-build/Release+Asserts/bin/clang++ -MMD -MF obj/sandbox/linux/sandbox_linux_unittests_sources/broker_process_unittest.o.d -DSANDBOX_USES_BASE_TEST_SUITE -DDCHECK_ALWAYS_ON=1 -DUSE_UDEV -DUSE_AURA=1 -DUSE_GLIB=1 -DUSE_OZONE=1 -D__STDC_CONSTANT_MACROS -D__STDC_FORMAT_MACROS -D_FORTIFY_SOURCE=2 -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_GNU_SOURCE -DCR_CLANG_REVISION=\"llvmorg-21-init-9266-g09006611-2\" -D_LIBCPP_HARDENING_MODE=_LIBCPP_HARDENING_MODE_EXTENSIVE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCXXABI_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCPP_INSTRUMENTED_WITH_ASAN=0 -DCR_LIBCXX_REVISION=f034fd5662d033c281ab6a9b45164066ddd18809 -DCR_SYSROOT_KEY=20250129T203412Z-1 -DNDEBUG -DNVALGRIND -DDYNAMIC_ANNOTATIONS_ENABLED=0 -DGLIB_VERSION_MAX_ALLOWED=GLIB_VERSION_2_56 -DGLIB_VERSION_MIN_REQUIRED=GLIB_VERSION_2_56 -DBENCHMARK_STATIC_DEFINE -DU_USING_ICU_NAMESPACE=0 -DU_ENABLE_DYLOAD=0 -DUSE_CHROMIUM_ICU=1 -DU_ENABLE_TRACING=1 -DU_ENABLE_RESOURCE_TRACING=0 -DU_STATIC_IMPLEMENTATION -DICU_UTIL_DATA_IMPL=ICU_UTIL_DATA_FILE -DGTEST_API_= -DGTEST_HAS_POSIX_RE=0 -DGTEST_HAS_ABSL -DGTEST_NO_ABSL_FLAGS -DUNIT_TEST -I../.. -Igen -I../../buildtools/third_party/libc++ -I../../third_party/perfetto/include -Igen/third_party/perfetto/build_config -Igen/third_party/perfetto -I../../third_party/google_benchmark/src/include -I../../base/allocator/partition_allocator/src -Igen/base/allocator/partition_allocator/src -I../../third_party/abseil-cpp -I../../third_party/boringssl/src/include -I../../third_party/protobuf/src -I../../third_party/ced/src -I../../third_party/icu/source/common -I../../third_party/icu/source/i18n -I../../third_party/googletest/custom -I../../third_party/googletest/src/googlemock/include -I../../third_party/googletest/src/googletest/include -I../../third_party/re2/src -Wall -Wextra -Wimplicit-fallthrough -Wextra-semi -Wunreachable-code-aggressive -Wthread-safety -Wgnu -Wno-gnu-anonymous-struct -Wno-gnu-conditional-omitted-operand -Wno-gnu-include-next -Wno-gnu-label-as-value -Wno-gnu-redeclared-enum -Wno-gnu-statement-expression -Wno-gnu-zero-variadic-macro-arguments -Wno-zero-length-array -Wno-missing-field-initializers -Wno-unused-parameter -Wno-psabi -Wloop-analysis -Wno-unneeded-internal-declaration -Wno-cast-function-type -Wno-thread-safety-reference-return -Wno-nontrivial-memcall -Wshadow -Werror -fno-delete-null-pointer-checks -fno-strict-overflow -fno-ident -fno-strict-aliasing -fstack-protector -funwind-tables -fPIC -pthread -fcolor-diagnostics -fmerge-all-constants -fno-sized-deallocation -fcrash-diagnostics-dir=../../tools/clang/crashreports -mllvm -instcombine-lower-dbg-declare=0 -mllvm -split-threshold-for-reg-with-hint=0 -ffp-contract=off -Wa,--crel,--allow-experimental-crel -fextend-variable-liveness=none -fcomplete-member-pointers -m64 -msse3 -Wno-builtin-macro-redefined -D__DATE__= -D__TIME__= -D__TIMESTAMP__= -ffile-compilation-dir=. -no-canonical-prefixes -Xclang --warning-suppression-mappings=../../build/config/warning_suppression.txt -ftrivial-auto-var-init=pattern -O2 -fdata-sections -ffunction-sections -fno-unique-section-names -fno-math-errno -fno-omit-frame-pointer -g0 -fvisibility=hidden -Wheader-hygiene -Wstring-conversion -Wtautological-overlap-compare -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/glib-2.0 -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/lib/x86_64-linux-gnu/glib-2.0/include -Wno-inconsistent-missing-override -Wno-invalid-offsetof -Wenum-compare-conditional -Wno-nullability-completeness -std=c++20 -Wno-trigraphs -gsimple-template-names -fno-exceptions -fno-rtti -nostdinc++ -isystem../../third_party/libc++/src/include -isystem../../third_party/libc++abi/src/include --sysroot=../../build/linux/debian_bullseye_amd64-sysroot -fvisibility-inlines-hidden  -c ../../sandbox/linux/syscall_broker/broker_process_unittest.cc -o obj/sandbox/linux/sandbox_linux_unittests_sources/broker_process_unittest.o
build step: cxx "./obj/sandbox/linux/sandbox_linux_unittests_sources/broker_process_unittest.o"
siso_rule: clang/cxx
stderr:
../../sandbox/linux/syscall_broker/broker_process_unittest.cc:618:42: error: invalid operands to binary expression ('std::array<int, 4>' and 'int')
  618 |   SANDBOX_ASSERT(0 == pipe(available_fds + 2));
      |                            ~~~~~~~~~~~~~ ^ ~
../../third_party/libc++/src/include/__iterator/reverse_iterator.h:303:1: note: candidate template ignored: could not match 'reverse_iterator<_Iter>' against 'int'
  303 | operator+(typename reverse_iterator<_Iter>::difference_type __n, const reverse_iterator<_Iter>& __x) {
      | ^
../../third_party/libc++/src/include/__iterator/move_iterator.h:317:1: note: candidate template ignored: could not match 'move_iterator<_Iter>' against 'int'
  317 | operator+(iter_difference_t<_Iter> __n, const move_iterator<_Iter>& __x)
      | ^
../../third_party/libc++/src/include/__iterator/wrap_iter.h:228:1: note: candidate template ignored: could not match '__wrap_iter<_Iter1>' against 'int'
  228 | operator+(typename __wrap_iter<_Iter1>::difference_type __n, __wrap_iter<_Iter1> __x) _NOEXCEPT {
      | ^
../../third_party/libc++/src/include/string:3732:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3732 | operator+(const basic_string<_CharT, _Traits, _Allocator>& __lhs,
      | ^
../../third_party/libc++/src/include/string:3739:1: note: candidate template ignored: could not match 'const _CharT *' against 'std::array<int, 4>'
 3739 | operator+(const _CharT* __lhs, const basic_string<_CharT, _Traits, _Allocator>& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3748:1: note: candidate template ignored: could not match 'basic_string<_CharT, _Traits, _Allocator>' against 'int'
 3748 | operator+(_CharT __lhs, const basic_string<_CharT, _Traits, _Allocator>& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3755:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3755 | operator+(const basic_string<_CharT, _Traits, _Allocator>& __lhs, const _CharT* __rhs) {
      | ^
../../third_party/libc++/src/include/string:3761:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3761 | operator+(const basic_string<_CharT, _Traits, _Allocator>& __lhs, _CharT __rhs) {
      | ^
../../third_party/libc++/src/include/string:3787:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3787 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, const basic_string<_CharT, _Traits, _Allocator>& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3793:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3793 | operator+(const basic_string<_CharT, _Traits, _Allocator>& __lhs, basic_string<_CharT, _Traits, _Allocator>&& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3799:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3799 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, basic_string<_CharT, _Traits, _Allocator>&& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3805:1: note: candidate template ignored: could not match 'const _CharT *' against 'std::array<int, 4>'
 3805 | operator+(const _CharT* __lhs, basic_string<_CharT, _Traits, _Allocator>&& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3811:1: note: candidate template ignored: could not match 'basic_string<_CharT, _Traits, _Allocator>' against 'int'
 3811 | operator+(_CharT __lhs, basic_string<_CharT, _Traits, _Allocator>&& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3818:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3818 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, const _CharT* __rhs) {
      | ^
../../third_party/libc++/src/include/string:3824:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3824 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, _CharT __rhs) {
      | ^
1 error generated.
build failed	
local:1 remote:0 cache:5 fallback:0 retry:0 skip:80564
reapi: ops: 25(err:3) / r:7(err:0) 83.70KiB / w:0(err:0) 0B
fs: ops: 2723(err:342) / r:1217(err:0) 13.12MiB / w:1(err:1) 0B
```

## First error

```
../../sandbox/linux/syscall_broker/broker_process_unittest.cc:618:42: error: invalid operands to binary expression ('std::array<int, 4>' and 'int')
  618 |   SANDBOX_ASSERT(0 == pipe(available_fds + 2));
      |                            ~~~~~~~~~~~~~ ^ ~
```

## Category
Rewriter needs to add .data() when converting a C-style array to std::array in a function call.

## Reason
The code was rewritten to use `std::array<int, 4> available_fds;`. The `pipe` system call expects a pointer to the first element of an array. The original code `pipe(available_fds)` worked because `available_fds` decayed to a pointer. However after rewriting `available_fds` is a `std::array` and does not decay to a pointer. Therefore we need to pass a pointer using `available_fds.data()`. Furthermore, the code passes `available_fds + 2`. The rewriter forgot to add `.data()` in this case.

## Solution
The rewriter needs to add `.data()` to arrayified variables when pointer arithmetic is used. The correct code should be `pipe(available_fds.data() + 2)`.

## Note
The rewriter also failed to consider the case where the return value of `std::size` must be casted to `size_t` for `subspan`.
```c++
       1 + *std::max_element(available_fds.data(),
                             base::span<int>(available_fds)
                                 .subspan(std::size(available_fds))
                                 .data());
```
should be
```c++
       1 + *std::max_element(available_fds.data(),
                             base::span<int>(available_fds)
                                 .subspan(static_cast<size_t>(std::size(available_fds)))
                                 .data());