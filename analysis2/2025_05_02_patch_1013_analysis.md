# Build Failure Analysis: 2025_05_02_patch_1013

## First error

../../media/base/vector_math.cc:146:5: error: return type 'std::pair<float, float> (*)(float, const float *, int, float)' must match previous return type 'std::pair<float, float> (*)(float, base::span<const float>, int, float)' when lambda expression has unspecified explicit return type
  146 |     return EWMAAndMaxPower_SSE;
      |     ^

## Category
Pointer passed into spanified function parameter.

## Reason
The function `vector_math::DispatchEWMAAndMaxPower` is being assigned different implementations based on CPU features. One of the implementations, `EWMAAndMaxPower_SSE`, takes a `const float* src[]` as an argument, while another implementation, `EWMAAndMaxPower_AVX2`, now takes `base::span<const float> src` as a function parameter, due to the spanification.

The compiler is complaining that when the lambda returns one or the other, they must have the same signature.

## Solution
The rewriter spanified `EWMAAndMaxPower_AVX2` but did not spanify the call sites in `vector_math::DispatchEWMAAndMaxPower`.

```diff
diff --git a/media/base/vector_math.cc b/media/base/vector_math.cc
index cdbdff7eadb54..21c1ad21f4254 100644
--- a/media/base/vector_math.cc
+++ b/media/base/vector_math.cc
@@ -143,7 +143,7 @@ std::pair<float, float> DispatchEWMAAndMaxPower(float initial_value,
   // |DispatchEWMAAndMaxPower| is very performance sensitive.  Make sure the
   // dispatch happens inline and at compile time:
   auto f = [&cpu, initial_value, src, len, smoothing_factor]() {
-    if (cpu.has_avx2() && cpu.has_fma3()) {
+   if (cpu.has_avx2() && cpu.has_fma3()) {
       return EWMAAndMaxPower_AVX2(initial_value, src, len, smoothing_factor);
     }
     return EWMAAndMaxPower_SSE;
```

Also, the function needs to be updated to accept `base::span<const float> src`.

```diff
diff --git a/media/base/vector_math.cc b/media/base/vector_math.cc
index cdbdff7eadb54..21c1ad21f4254 100644
--- a/media/base/vector_math.cc
+++ b/media/base/vector_math.cc
@@ -143,10 +143,10 @@ std::pair<float, float> DispatchEWMAAndMaxPower(float initial_value,
   // |DispatchEWMAAndMaxPower| is very performance sensitive.  Make sure the
   // dispatch happens inline and at compile time:
   auto f = [&cpu, initial_value, src, len, smoothing_factor]() {
-    if (cpu.has_avx2() && cpu.has_fma3()) {
+   if (cpu.has_avx2() && cpu.has_fma3()) {
       return EWMAAndMaxPower_AVX2(initial_value, src, len, smoothing_factor);
     }
-    return EWMAAndMaxPower_SSE;
+   return EWMAAndMaxPower_SSE(initial_value, src, len, smoothing_factor);
   };
   return f();
 }
```

## Note
The other errors are follow-up errors from the first error.
```
../../media/base/vector_math.cc:497:23: error: reinterpret_cast from 'base::span<const float>' to 'uintptr_t' (aka 'unsigned long') is not allowed
  497 |   bool aligned_src = (reinterpret_cast<uintptr_t>(src) & 0x1F) == 0;
      |                       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
In file included from ../../media/base/vector_math.cc:5:
In file included from ../../base/containers/span.h:36:
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
../../media/base/vector_math.cc:502:67: note: in instantiation of function template specialization 'base::internal::StrictNumeric<unsigned long>::StrictNumeric<int>' requested here
  502 |             ? _mm256_load_ps(base::span<const float>(src).subspan(i).data())
      |                                                                   ^
../../base/numerics/safe_conversions.h:229:15: note: candidate template ignored: constraints not satisfied [with Dst = unsigned long, Src = int, SrcType = UnderlyingType<int>]
  229 | constexpr Dst strict_cast(Src value) {
      |               ^
../../base/numerics/safe_conversions.h:227:7: note: because 'kStaticDstRangeRelationToSrcRange<unsigned long, int> == NumericRangeRepresentation::kContained' evaluated to false
  227 |       kStaticDstRangeRelationToSrcRange<Dst, SrcType> ==
      |       ^
2 errors generated.
FAILED: ba3842f5-9b53-4891-8375-19f66ba94ff3 "./obj/media/base/perftests/vector_math_perftest.o" CXX obj/media/base/perftests/vector_math_perftest.o
err: exit=1
../../third_party/llvm-build/Release+Asserts/bin/clang++ -MMD -MF obj/media/base/perftests/vector_math_perftest.o.d -DDCHECK_ALWAYS_ON=1 -DUSE_UDEV -DUSE_AURA=1 -DUSE_GLIB=1 -DUSE_OZONE=1 -D__STDC_CONSTANT_MACROS -D__STDC_FORMAT_MACROS -D_FORTIFY_SOURCE=2 -D_FILE_OFFSET_BITS=64 -D_LARGEFILE_SOURCE -D_LARGEFILE64_SOURCE -D_GNU_SOURCE -DCR_CLANG_REVISION=\"llvmorg-21-init-9266-g09006611-2\" -D_LIBCPP_HARDENING_MODE=_LIBCPP_HARDENING_MODE_EXTENSIVE -D_LIBCPP_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCXXABI_DISABLE_VISIBILITY_ANNOTATIONS -D_LIBCPP_INSTRUMENTED_WITH_ASAN=0 -DCR_LIBCXX_REVISION=f034fd5662d033c281ab6a9b45164066ddd18809 -DCR_SYSROOT_KEY=20250129T203412Z-1 -DNDEBUG -DNVALGRIND -DDYNAMIC_ANNOTATIONS_ENABLED=0 -DUSE_PULSEAUDIO -DDLOPEN_PULSEAUDIO -DGLIB_VERSION_MAX_ALLOWED=GLIB_VERSION_2_56 -DGLIB_VERSION_MIN_REQUIRED=GLIB_VERSION_2_56 -DBENCHMARK_STATIC_DEFINE -DSK_ENABLE_SKSL -DSK_UNTIL_CRBUG_1187654_IS_FIXED -DSK_USER_CONFIG_HEADER=\"../../skia/config/SkUserConfig.h\" -DSK_WIN_FONTMGR_NO_SIMULATIONS -DSK_DISABLE_LEGACY_INIT_DECODERS -DSK_CODEC_DECODES_JPEG -DSK_CODEC_ENCODES_JPEG -DSK_GAMMA_EXPONENT=1.2 -DSK_GAMMA_CONTRAST=0.2 -DSK_GANESH -DSK_GPU_WORKAROUNDS_HEADER=\"gpu/config/gpu_driver_bug_workaround_autogen.h\" -DSK_GL -DSK_VULKAN=1 -DSK_GRAPHITE -DSK_DAWN -DVK_USE_PLATFORM_XCB_KHR -DVK_USE_PLATFORM_XLIB_KHR -DVK_USE_PLATFORM_WAYLAND_KHR -DCHROMIUM -DLIBYUV_DISABLE_NEON -DLIBYUV_DISABLE_SVE -DLIBYUV_DISABLE_SME -DLIBYUV_DISABLE_LSX -DLIBYUV_DISABLE_LASX -DU_USING_ICU_NAMESPACE=0 -DU_ENABLE_DYLOAD=0 -DUSE_CHROMIUM_ICU=1 -DU_ENABLE_TRACING=1 -DU_ENABLE_RESOURCE_TRACING=0 -DU_STATIC_IMPLEMENTATION -DICU_UTIL_DATA_IMPL=ICU_UTIL_DATA_FILE -DGTEST_API_= -DGTEST_HAS_POSIX_RE=0 -DGTEST_HAS_ABSL -DGTEST_NO_ABSL_FLAGS -DUNIT_TEST -DGOOGLE_PROTOBUF_NO_RTTI -DHAVE_PTHREAD -DLEVELDB_PLATFORM_CHROMIUM=1 -DCRASHPAD_ZLIB_SOURCE_EXTERNAL -I../.. -Igen -I../../buildtools/third_party/libc++ -I../../third_party/perfetto/include -Igen/third_party/perfetto/build_config -Igen/third_party/perfetto -I../../third_party/google_benchmark/src/include -I../../third_party/skia -Igen/third_party/skia -I../../third_party/wuffs/src/release/c -I../../third_party/vulkan-headers/src/include -I../../third_party/wayland/src/src -I../../third_party/wayland/include/src -Igen/third_party/dawn/include -I../../third_party/dawn/include -I../../net/third_party/quiche/overrides -I../../net/third_party/quiche/src/quiche/common/platform/default -I../../net/third_party/quiche/src -I../../third_party/khronos -I../../gpu -I../../third_party/libyuv/include -I../../base/allocator/partition_allocator/src -Igen/base/allocator/partition_allocator/src -I../../third_party/abseil-cpp -I../../third_party/boringssl/src/include -I../../third_party/protobuf/src -I../../third_party/ced/src -I../../third_party/icu/source/common -I../../third_party/icu/source/i18n -I../../third_party/googletest/custom -I../../third_party/googletest/src/googlemock/include -I../../third_party/googletest/src/googletest/include -I../../third_party/re2/src -I../../third_party/libwebm/source -I../../third_party/angle/include -I../../third_party/mesa_headers -I../../third_party/ipcz/include -I../../third_party/leveldatabase -I../../third_party/leveldatabase/src -I../../third_party/leveldatabase/src/include -I../../third_party/crashpad/crashpad -I../../third_party/crashpad/crashpad/compat/linux -I../../third_party/crashpad/crashpad/compat/non_win -I../../third_party/zlib -I../../third_party/libaom/source/libaom -I../../third_party/libaom/source/config/linux/x64 -Wall -Wextra -Wimplicit-fallthrough -Wextra-semi -Wunreachable-code-aggressive -Wthread-safety -Wgnu -Wno-gnu-anonymous-struct -Wno-gnu-conditional-omitted-operand -Wno-gnu-include-next -Wno-gnu-label-as-value -Wno-gnu-redeclared-enum -Wno-gnu-statement-expression -Wno-gnu-zero-variadic-macro-arguments -Wno-zero-length-array -Wno-missing-field-initializers -Wno-unused-parameter -Wno-psabi -Wloop-analysis -Wno-unneeded-internal-declaration -Wno-cast-function-type -Wno-thread-safety-reference-return -Wno-nontrivial-memcall -Wshadow -Werror -fno-delete-null-pointer-checks -fno-strict-overflow -fno-ident -fno-strict-aliasing -fstack-protector -funwind-tables -fPIC -pthread -fcolor-diagnostics -fmerge-all-constants -fno-sized-deallocation -fcrash-diagnostics-dir=../../tools/clang/crashreports -mllvm -instcombine-lower-dbg-declare=0 -mllvm -split-threshold-for-reg-with-hint=0 -ffp-contract=off -Wa,--crel,--allow-experimental-crel -fextend-variable-liveness=none -fcomplete-member-pointers -m64 -msse3 -Wno-builtin-macro-redefined -D__DATE__= -D__TIME__= -D__TIMESTAMP__= -ffile-compilation-dir=. -no-canonical-prefixes -Xclang --warning-suppression-mappings=../../build/config/warning_suppression.txt -ftrivial-auto-var-init=pattern -O2 -fdata-sections -ffunction-sections -fno-unique-section-names -fno-math-errno -fno-omit-frame-pointer -g0 -fvisibility=hidden -Wheader-hygiene -Wstring-conversion -Wtautological-overlap-compare -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/include/glib-2.0 -isystem../../build/linux/debian_bullseye_amd64-sysroot/usr/lib/x86_64-linux-gnu/glib-2.0/include -Wno-redundant-parens -Wno-redundant-parens -Wno-inconsistent-missing-override -Wno-invalid-offsetof -Wenum-compare-conditional -Wno-nullability-completeness -std=c++20 -Wno-trigraphs -gsimple-template-names -fno-exceptions -fno-rtti -nostdinc++ -isystem../../third_party/libc++/src/include -isystem../../third_party/libc++abi/src/include --sysroot=../../build/linux/debian_bullseye_amd64-sysroot -fvisibility-inlines-hidden  -c ../../media/base/vector_math_perftest.cc -o obj/media/base/perftests/vector_math_perftest.o
build step: cxx "./obj/media/base/perftests/vector_math_perftest.o"
siso_rule: clang/cxx
stderr:
../../media/base/vector_math_perftest.cc:260:5: error: no matching member function for call to 'RunBenchmark'
  260 |     RunBenchmark(vector_math::EWMAAndMaxPower_AVX2, kVectorSize - 1,
      |     ^~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:90:8: note: candidate function not viable: no known conversion from 'std::pair<float, float> (float, base::span<const float>, int, float)' to 'std::pair<float, float> (*)(float, const float *, int, float)' for 1st argument
   90 |   void RunBenchmark(
      |        ^
   91 |       std::pair<float, float> (*fn)(float, const float[], int, float),
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:58:8: note: candidate function not viable: no known conversion from 'std::pair<float, float> (float, base::span<const float>, int, float)' to 'void (*)(const float *, float, int, float *)' for 1st argument
   58 |   void RunBenchmark(void (*fn)(const float[], float, int, float[]),
      |        ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:279:5: error: no matching member function for call to 'RunBenchmark'
  279 |     RunBenchmark(vector_math::EWMAAndMaxPower_AVX2, kVectorSize,
      |     ^~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:90:8: note: candidate function not viable: no known conversion from 'std::pair<float, float> (float, base::span<const float>, int, float)' to 'std::pair<float, float> (*)(float, const float *, int, float)' for 1st argument
   90 |   void RunBenchmark(
      |        ^
   91 |       std::pair<float, float> (*fn)(float, const float[], int, float),
      |       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../media/base/vector_math_perftest.cc:58:8: note: candidate function not viable: no known conversion from 'std::pair<float, float> (float, base::span<const float>, int, float)' to 'void (*)(const float *, float, int, float *)' for 1st argument
   58 |   void RunBenchmark(void (*fn)(const float[], float, int, float[]),
      |        ^            ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
2 errors generated.