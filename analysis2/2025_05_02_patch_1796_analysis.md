# Build Failure: 2025_05_02_patch_1796

## Chromium Revision

`a3ffac36a0fd4cbdc95cd5ec879816b9634a1d56`

## Code Changes (Diff)

```diff
diff --git a/media/base/audio_bus_unittest.cc b/media/base/audio_bus_unittest.cc
index ff0a1470a3e23..1077e87d8e345 100644
--- a/media/base/audio_bus_unittest.cc
+++ b/media/base/audio_bus_unittest.cc
@@ -416,12 +416,12 @@ static const int16_t kTestVectorInt16[kTestVectorSize] = {
 static const int32_t kTestVectorInt32[kTestVectorSize] = {
     INT32_MIN,     0, INT32_MAX, INT32_MIN, INT32_MAX / 2,
     INT32_MIN / 2, 0, INT32_MAX, 0,         0};
-static const float kTestVectorFloat32[kTestVectorSize] = {
+static const std::array<float, kTestVectorSize> kTestVectorFloat32 = {
     -1.0f, 0.0f, 1.0f, -1.0f, 0.5f, -0.5f, 0.0f, 1.0f, 0.0f, 0.0f};
 
 // This is based on kTestVectorFloat32, but has some of the values outside of
 // sanity.
-static const float kTestVectorFloat32Invalid[kTestVectorSize] = {
+static const std::array<float, kTestVectorSize> kTestVectorFloat32Invalid = {
     -5.0f,
     0.0f,
     5.0f,
@@ -433,7 +433,7 @@ static const float kTestVectorFloat32Invalid[kTestVectorSize] = {
     std::numeric_limits<float>::signaling_NaN(),
     std::numeric_limits<float>::quiet_NaN()};
 
-static const float kTestVectorFloat32Sanitized[kTestVectorSize] = {
+static const std::array<float, kTestVectorSize> kTestVectorFloat32Sanitized = {
     -1.0f, 0.0f, 1.0f, -1.0f, 0.5f, -0.5f, 0.0f, 1.0f, 0.0f, 0.0f};
 
 // Expected results.
@@ -485,7 +485,7 @@ TEST_F(AudioBusTest, FromInterleaved) {
   {
     SCOPED_TRACE("Float32SampleTypeTraits");
     bus->Zero();
-    bus->FromInterleaved<Float32SampleTypeTraits>(kTestVectorFloat32,
+    bus->FromInterleaved<Float32SampleTypeTraits>(kTestVectorFloat32.data(),
                                                   kTestVectorFrameCount);
     VerifyAreEqual(bus.get(), expected.get());
   }
@@ -566,16 +566,17 @@ TEST_F(AudioBusTest, ToInterleaved) {
     SCOPED_TRACE("Float32SampleTypeTraits");
     float test_array[std::size(kTestVectorFloat32)];
     bus->ToInterleaved<Float32SampleTypeTraits>(bus->frames(), test_array);
-    ASSERT_EQ(
-        0, memcmp(test_array, kTestVectorFloat32, sizeof(kTestVectorFloat32)));
+    ASSERT_EQ(0, memcmp(test_array, kTestVectorFloat32.data(),
+                        (kTestVectorFloat32.size() *
+                         sizeof(decltype(kTestVectorFloat32)::value_type))));
   }
 }
 
 TEST_F(AudioBusTest, ToInterleavedSanitized) {
   std::unique_ptr<AudioBus> bus =
       AudioBus::Create(kTestVectorChannelCount, kTestVectorFrameCount);
-  bus->FromInterleaved<Float32SampleTypeTraits>(kTestVectorFloat32Invalid,
-                                                bus->frames());
+  bus->FromInterleaved<Float32SampleTypeTraits>(
+      kTestVectorFloat32Invalid.data(), bus->frames());
   // Verify FromInterleaved applied no sanity.
   ASSERT_EQ(bus->channel_span(0)[0], kTestVectorFloat32Invalid[0]);
   std::array<float, std::size(kTestVectorFloat32Sanitized)> test_array;
@@ -598,12 +599,12 @@ TEST_F(AudioBusTest, ToInterleavedSanitized) {
 
 TEST_F(AudioBusTest, CopyAndClipTo) {
   auto bus = AudioBus::Create(kTestVectorChannelCount, kTestVectorFrameCount);
-  bus->FromInterleaved<Float32SampleTypeTraits>(kTestVectorFloat32Invalid,
-                                                bus->frames());
+  bus->FromInterleaved<Float32SampleTypeTraits>(
+      kTestVectorFloat32Invalid.data(), bus->frames());
   auto expected =
       AudioBus::Create(kTestVectorChannelCount, kTestVectorFrameCount);
   expected->FromInterleaved<Float32SampleTypeTraits>(
-      kTestVectorFloat32Sanitized, bus->frames());
+      kTestVectorFloat32Sanitized.data(), bus->frames());
 
   // Verify FromInterleaved applied no sanity.
   ASSERT_EQ(bus->channel_span(0)[0], kTestVectorFloat32Invalid[0]);
```

## Build Failure Log

```

19.71s Build Failure: 1 done 1 failed 14087 remaining - 0.05/s
 1 steps failed: exit=1
see ./out/linux/siso_output for full command line and output
 or ./out/linux/siso.INFO
use ./out/linux/siso_failed_commands.sh to re-run failed commands
real	0m20.055s
user	2m48.939s
sys	2m33.363s
ninja: Entering directory `out/linux'
init credentials done 54.39331ms
reapi instance: projects/rbe-chrome-untrusted/instances/default_instance
loading fs state done 1.140453661s
loading/recompacting deps log done 949.216983ms
load siso config done 92.904524ms
load build.ninja done 1.649143563s
schedule pending:0+ready:1 (node:324309 edge:2)
build start: Ready 1 Pending 1
rebuild manifest finished	
schedule pending:0+ready:1 (node:324309 edge:9)
schedule pending:102190+ready:11200 (node:324309 edge:113393)
 1.10s schedule pending:109791+ready:13477 (node:324309 edge:123268)
build start: Ready 13477 Pending 109791
FAILED: e8c1c75c-9671-41cc-b109-26e324880d26 "./obj/media/base/unit_tests/audio_bus_unittest.o" CXX obj/media/base/unit_tests/audio_bus_unittest.o
err: exit=1
../../third_party/llvm-build/Release+Asserts/bin/clang++ -MMD -MF obj/media/base/unit_tests/audio_bus_unittest.o.d -DDCHECK_ALWAYS_ON=1 -DUSE_UDEV -DUSE_AURA=1 -DUSE_GLIB=1 -DUSE_OZONE=1 -D__STDC_CONSTANT_MACROS -D__STDC_FORMAT_MACROS -D_FORTIFY_SOURCE=2 -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_GNU_SOURCE -DCR_CLANG_REVISION=\"llvmorg-21-init-9266-g09006611-2\" -D_LIBCPP_HARDENING_MODE=_LIBCPP_HARDENING_MODE_EXTENSIVE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCXXABI_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCPP_INSTRUMENTED_WITH_ASAN=0 -DCR_LIBCXX_REVISION=f034fd5662d033c281ab6a9b45164066ddd18809 -DCR_SYSROOT_KEY=20250129T203412Z-1 -DNDEBUG -DNVALGRIND -DDYNAMIC_ANNOTATIONS_ENABLED=0 -DUSE_PULSEAUDIO -DDLOPEN_PULSEAUDIO -DGLIB_VERSION_MAX_ALLOWED=GLIB_VERSION_2_56 -DGLIB_VERSION_MIN_REQUIRED=GLIB_VERSION_2_56 -DBENCHMARK_STATIC_DEFINE -DSK_ENABLE_SKSL -DSK_UNTIL_CRBUG_1187654_IS_FIXED -DSK_USER_CONFIG_HEADER=\"../../skia/config/SkUserConfig.h\" -DSK_WIN_FONTMGR_NO_SIMULATIONS -DSK_DISABLE_LEGACY_INIT_DECODERS -DSK_CODEC_DECODES_JPEG -DSK_CODEC_ENCODES_JPEG -DSK_GAMMA_EXPONENT=1.2 -DSK_GAMMA_CONTRAST=0.2 -DSK_GANESH -DSK_GPU_WORKAROUNDS_HEADER=\"gpu/config/gpu_driver_bug_workaround_autogen.h\" -DSK_GL -DSK_VULKAN=1 -DSK_GRAPHITE -DSK_DAWN -DVK_USE_PLATFORM_XCB_KHR -DVK_USE_PLATFORM_XLIB_KHR -DVK_USE_PLATFORM_WAYLAND_KHR -DCHROMIUM -DLIBYUV_DISABLE_NEON -DLIBYUV_DISABLE_SVE -DLIBYUV_DISABLE_SME -DLIBYUV_DISABLE_LSX -DLIBYUV_DISABLE_LASX -DU_USING_ICU_NAMESPACE=0 -DU_ENABLE_DYLOAD=0 -DUSE_CHROMIUM_ICU=1 -DU_ENABLE_TRACING=1 -DU_ENABLE_RESOURCE_TRACING=0 -DU_STATIC_IMPLEMENTATION -DICU_UTIL_DATA_IMPL=ICU_UTIL_DATA_FILE -DGTEST_API_= -DGTEST_HAS_POSIX_RE=0 -DGTEST_HAS_ABSL -DGTEST_NO_ABSL_FLAGS -DUNIT_TEST -DCRASHPAD_ZLIB_SOURCE_EXTERNAL -DGOOGLE_PROTOBUF_NO_RTTI -DHAVE_PTHREAD -DLEVELDB_PLATFORM_CHROMIUM=1 -I../.. -Igen -I../../buildtools/third_party/libc++ -I../../third_party/perfetto/include -Igen/third_party/perfetto/build_config -Igen/third_party/perfetto -I../../third_party/google_benchmark/src/include -I../../net/third_party/quiche/overrides -I../../net/third_party/quiche/src/quiche/common/platform/default -I../../net/third_party/quiche/src -I../../third_party/skia -Igen/third_party/skia -I../../third_party/wuffs/src/release/c -I../../third_party/vulkan-headers/src/include -I../../third_party/wayland/src/src -I../../third_party/wayland/include/src -Igen/third_party/dawn/include -I../../third_party/dawn/include -I../../third_party/khronos -I../../gpu -I../../third_party/libyuv/include -I../../base/allocator/partition_allocator/src -Igen/base/allocator/partition_allocator/src -I../../third_party/abseil-cpp -I../../third_party/boringssl/src/include -I../../third_party/protobuf/src -I../../third_party/ced/src -I../../third_party/icu/source/common -I../../third_party/icu/source/i18n -I../../third_party/googletest/custom -I../../third_party/googletest/src/googlemock/include -I../../third_party/googletest/src/googletest/include -I../../third_party/re2/src -I../../third_party/ipcz/include -I../../third_party/crashpad/crashpad -I../../third_party/crashpad/crashpad/compat/linux -I../../third_party/crashpad/crashpad/compat/non_win -I../../third_party/zlib -I../../third_party/angle/include -I../../third_party/mesa_headers -I../../third_party/libwebm/source -I../../third_party/leveldatabase -I../../third_party/leveldatabase/src -I../../third_party/leveldatabase/src/include -I../../third_party/libaom/source/libaom -I../../third_party/libaom/source/config/linux/x64 -Igen/net/third_party/quiche/src -Wall -Wextra -Wimplicit-fallthrough -Wextra-semi -Wunreachable-code-aggressive -Wthread-safety -Wgnu -Wno-gnu-anonymous-struct -Wno-gnu-conditional-omitted-operand -Wno-gnu-include-next -Wno-gnu-label-as-value -Wno-gnu-redeclared-enum -Wno-gnu-statement-expression -Wno-gnu-zero-variadic-macro-arguments -Wno-zero-length-array -Wno-missing-field-initializers -Wno-unused-parameter -Wno-psabi -Wloop-analysis -Wno-unneeded-internal-declaration -Wno-cast-function-type -Wno-thread-safety-reference-return -Wno-nontrivial-memcall -Wshadow -Werror -fno-delete-null-pointer-checks -fno-strict-overflow -fno-ident -fno-strict-aliasing -fstack-protector -funwind-tables -fPIC -pthread -fcolor-diagnostics -fmerge-all-constants -fno-sized-deallocation -fcrash-diagnostics-dir=../../tools/clang/crashreports -mllvm -instcombine-lower-dbg-declare=0 -mllvm -split-threshold-for-reg-with-hint=0 -ffp-contract=off -Wa,--crel,--allow-experimental-crel -fextend-variable-liveness=none -fcomplete-member-pointers -m64 -msse3 -Wno-builtin-macro-redefined -D__DATE__= -D__TIME__= -D__TIMESTAMP__= -ffile-compilation-dir=. -no-canonical-prefixes -Xclang --warning-suppression-mappings=../../build/config/warning_suppression.txt -ftrivial-auto-var-init=pattern -O2 -fdata-sections -ffunction-sections -fno-unique-section-names -fno-math-errno -fno-omit-frame-pointer -g0 -fvisibility=hidden -Wheader-hygiene -Wstring-conversion -Wtautological-overlap-compare -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/glib-2.0 -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/lib/x86_64-linux-gnu/glib-2.0/include -Wno-redundant-parens -Wno-redundant-parens -Wno-inconsistent-missing-override -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/nss -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/nspr -Wno-invalid-offsetof -Wenum-compare-conditional -Wno-nullability-completeness -std=c++20 -Wno-trigraphs -gsimple-template-names -fno-exceptions -fno-rtti -nostdinc++ -isystem../../third_party/libc++/src/include -isystem../../third_party/libc++abi/src/include --sysroot=../../build/linux/debian_bullseye_amd64-sysroot -fvisibility-inlines-hidden  -c ../../media/base/audio_bus_unittest.cc -o obj/media/base/unit_tests/audio_bus_unittest.o
build step: cxx "./obj/media/base/unit_tests/audio_bus_unittest.o"
siso_rule: clang/cxx
stderr:
../../media/base/audio_bus_unittest.cc:646:56: error: invalid operands to binary expression ('const std::array<float, kTestVectorSize>' and 'size_t' (aka 'unsigned long'))
  646 |     ASSERT_EQ(0, memcmp(test_array, kTestVectorFloat32 +
      |                                     ~~~~~~~~~~~~~~~~~~ ^
  647 |                                         kPartialStart * kTestVectorChannelCount,
      |                                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../third_party/googletest/src/googletest/include/gtest/gtest.h:1914:53: note: expanded from macro 'ASSERT_EQ'
 1914 | #define ASSERT_EQ(val1, val2) GTEST_ASSERT_EQ(val1, val2)
      |                                                     ^~~~
../../third_party/googletest/src/googletest/include/gtest/gtest.h:1898:69: note: expanded from macro 'GTEST_ASSERT_EQ'
 1898 |   ASSERT_PRED_FORMAT2(::testing::internal::EqHelper::Compare, val1, val2)
      |                                                                     ^~~~
../../third_party/googletest/src/googletest/include/gtest/gtest_pred_impl.h:148:40: note: expanded from macro 'ASSERT_PRED_FORMAT2'
  148 |   GTEST_PRED_FORMAT2_(pred_format, v1, v2, GTEST_FATAL_FAILURE_)
      |                                        ^~
../../third_party/googletest/src/googletest/include/gtest/gtest_pred_impl.h:134:43: note: expanded from macro 'GTEST_PRED_FORMAT2_'
  134 |   GTEST_ASSERT_(pred_format(#v1, #v2, v1, v2), on_failure)
      |                                           ^~
../../third_party/googletest/src/googletest/include/gtest/gtest_pred_impl.h:79:52: note: expanded from macro 'GTEST_ASSERT_'
   79 |   if (const ::testing::AssertionResult gtest_ar = (expression)) \
      |                                                    ^~~~~~~~~~
../../third_party/libc++/src/include/__iterator/reverse_iterator.h:303:1: note: candidate template ignored: could not match 'reverse_iterator<_Iter>' against 'size_t' (aka 'unsigned long')
  303 | operator+(typename reverse_iterator<_Iter>::difference_type __n, const reverse_iterator<_Iter>& __x) {
      | ^
../../third_party/libc++/src/include/__iterator/wrap_iter.h:228:1: note: candidate template ignored: could not match '__wrap_iter<_Iter1>' against 'size_t' (aka 'unsigned long')
  228 | operator+(typename __wrap_iter<_Iter1>::difference_type __n, __wrap_iter<_Iter1> __x) _NOEXCEPT {
      | ^
../../third_party/libc++/src/include/__iterator/move_iterator.h:317:1: note: candidate template ignored: could not match 'move_iterator<_Iter>' against 'size_t' (aka 'unsigned long')
  317 | operator+(iter_difference_t<_Iter> __n, const move_iterator<_Iter>& __x)
      | ^
../../third_party/libc++/src/include/string:3732:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3732 | operator+(const basic_string<_CharT, _Traits, _Allocator>& __lhs,
      | ^
../../third_party/libc++/src/include/string:3739:1: note: candidate template ignored: could not match 'const _CharT *' against 'std::array<float, kTestVectorSize>'
 3739 | operator+(const _CharT* __lhs, const basic_string<_CharT, _Traits, _Allocator>& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3748:1: note: candidate template ignored: could not match 'basic_string<_CharT, _Traits, _Allocator>' against 'size_t' (aka 'unsigned long')
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
../../third_party/libc++/src/include/string:3805:1: note: candidate template ignored: could not match 'const _CharT *' against 'std::array<float, kTestVectorSize>'
 3805 | operator+(const _CharT* __lhs, basic_string<_CharT, _Traits, _Allocator>&& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3811:1: note: candidate template ignored: could not match 'basic_string<_CharT, _Traits, _Allocator>' against 'size_t' (aka 'unsigned long')
 3811 | operator+(_CharT __lhs, basic_string<_CharT, _Traits, _Allocator>& __rhs) {
      | ^
../../third_party/libc++/src/include/string:3818:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3818 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, const _CharT* __rhs) {
      | ^
../../third_party/libc++/src/include/string:3824:1: note: candidate template ignored: could not match 'basic_string' against 'std::array'
 3824 | operator+(basic_string<_CharT, _Traits, _Allocator>&& __lhs, _CharT __rhs) {
      | ^
../../media/base/audio_bus_unittest.cc:648:49: error: indirection requires pointer operand ('const std::array<float, kTestVectorSize>' invalid)
  648 |                         kPartialFrames * sizeof(*kTestVectorFloat32) *
      |                                                 ^~~~~~~~~~~~~~~~~~~
2 errors generated.
build failed	
local:1 remote:0 cache:0 fallback:0 retry:0 skip:109180
reapi: ops: 17(err:1) / r:0(err:0) 0B / w:0(err:0) 0B
fs: ops: 1840(err:114) / r:866(err:0) 8.11MiB / w:0(err:0) 0B
```

## First error

```
../../media/base/audio_bus_unittest.cc:646:56: error: invalid operands to binary expression ('const std::array<float, kTestVectorSize>' and 'size_t' (aka 'unsigned long'))
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code was performing pointer arithmetic on `kTestVectorFloat32`, which is now a `std::array`.  The expression `kTestVectorFloat32 + kPartialStart * kTestVectorChannelCount` attempts to add an offset to the `std::array` itself, which is not allowed. The rewriter should have recognized this pattern and added `.data()` to get a pointer to the underlying data.

## Solution
The rewriter needs to insert `.data()` to get a pointer and allow pointer arithmetic.

```
-        kPartialStart * sizeof(*kTestVectorFloat32) *
+        kPartialStart * sizeof(*kTestVectorFloat32.data()) *
```

## Note
The same fix should also be applied to `audio_bus_unittest.cc:646`