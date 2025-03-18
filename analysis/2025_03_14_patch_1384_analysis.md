# Build Failure Analysis: 2025_03_14_patch_1384

## First error

../../components/viz/test/gl_scaler_test_util.cc:316:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. `SkBitmap::getAddr32` returns `uint32_t*`, but the rewriter replaced the initialization statement with a `base::span<uint32_t>`. It tried to spanify `GLScalerTestUtil::UnpackPlanarBitmap`, but it didn't update the callsite, which is: `out->getAddr32(0, y)`

## Solution
The rewriter should spanify the callsite to pass the `uint32_t*` into `base::span<uint32_t>`. It should generate something like:
```c++
const base::span<uint32_t> dst = base::span(out->getAddr32(0, y), out->width());
```

## Note
Additional errors:
```
../../base/containers/span.h:1005:14: note: because 'internal::CompatibleRange<element_type, unsigned int *>' evaluated to false
 1005 |     requires(internal::CompatibleRange<element_type, R> &&
      |              ^
../../base/containers/span.h:373:5: note: because 'unsigned int *' does not satisfy 'contiguous_range'
  373 |     std::ranges::contiguous_range<R> && std::ranges::sized_range<R> &&
      |     ^
../../third_party/libc++/src/include/__ranges/concepts.h:115:28: note: because 'unsigned int *' does not satisfy 'random_access_range'
  115 | concept contiguous_range = random_access_range<_Tp> && contiguous_iterator<iterator_t<_Tp>>;
      |                            ^
../../third_party/libc++/src/include/__ranges/concepts.h:112:31: note: because 'unsigned int *' does not satisfy 'bidirectional_range'
  112 | concept random_access_range = bidirectional_range<_Tp> && random_access_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:109:31: note: because 'unsigned int *' does not satisfy 'forward_range'
  109 | concept bidirectional_range = forward_range<_Tp> && forward_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:106:25: note: because 'unsigned int *' does not satisfy 'input_range'
  106 | concept forward_range = input_range<_Tp> && input_iterator<iterator_t<_Tp>>;
      |                         ^
../../third_party/libc++/src/include/__ranges/concepts.h:53:23: note: because 'unsigned int *' does not satisfy 'range'
   53 | concept input_range = range<_Tp> && input_iterator<iterator_t<_Tp>>;
      |                       ^
../../third_party/libc++/src/include/__ranges/concepts.h:48:3: note: because 'ranges::begin(__t)' would be invalid: call to deleted function call operator in type 'const __begin::__fn'
   48 |   ranges::begin(__t); // sometimes equality-preserving
      |   ^
../../base/containers/span.h:1025:13: note: candidate constructor not viable: constraints not satisfied
 1025 |   constexpr span(std::initializer_list<value_type> il LIFETIME_BOUND)
      |             ^
../../base/containers/span.h:1026:14: note: because 'std::is_const_v<element_type>' evaluated to false
 1026 |     requires(std::is_const_v<element_type>)
      |              ^