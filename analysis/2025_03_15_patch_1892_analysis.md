# Build Failure Analysis: 2025_03_15_patch_1892

## First error

../../net/websockets/websocket_inflater.cc:106:25: error: no viable conversion from 'char *' to 'base::span<char>'
  106 |     output_buffer_.Read(&buffer->data()[num_bytes_copied], num_bytes_to_copy);

## Category
Rewriter needs to prevent function inlining in span if it contains .data() call

## Reason
The rewriter converted a raw pointer into a `base::span`, but failed to ensure that `.data()` is added in the correct place.
The root cause is the compiler inlined the call to  `__asan_memcpy` which caused the rewriter to miss the usage and not add .data(). This particular piece of code is inside a header so the flags must be changed to prevent inlining.

```
../../net/websockets/websocket_inflater.cc:106:25: error: no viable conversion from 'char *' to 'base::span<char>'
  106 |     output_buffer_.Read(&buffer->data()[num_bytes_copied], num_bytes_to_copy);
      |                         ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1032:13: note: candidate constructor not viable: no known conversion from 'char *' to 'const span<char> &' for 1st argument
 1032 |   constexpr span(const span& other) noexcept = default;
      |             ^    ~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1042:13: note: candidate constructor not viable: no known conversion from 'char *' to 'span<char> &&' for 1st argument
 1042 |   constexpr span(span&& other) noexcept = default;
      |             ^    ~~~~~~~~~~~~
../../base/containers/span.h:998:13: note: candidate template ignored: could not match 'std::type_identity_t<element_type>[N]' (aka 'char[N]') against 'char *'
  998 |   constexpr span(
      |             ^
../../base/containers/span.h:1007:13: note: candidate template ignored: constraints not satisfied [with R = char *]
 1007 |   constexpr span(R&& range)
      |             ^
../../base/containers/span.h:1005:14: note: because 'internal::CompatibleRange<element_type, char *>' evaluated to false
 1005 |     requires(internal::CompatibleRange<element_type, R> &&
      |              ^
../../base/containers/span.h:373:5: note: because 'char *' does not satisfy 'contiguous_range'
  373 |     std::ranges::contiguous_range<R> && std::ranges::sized_range<R> &&
      |     ^
../../third_party/libc++/src/include/__ranges/concepts.h:115:28: note: because 'char *' does not satisfy 'random_access_range'
  115 | concept contiguous_range = random_access_range<_Tp> && contiguous_iterator<iterator_t<_Tp>> && requires(_Tp& __t) {
      |                            ^
../../third_party/libc++/src/include/__ranges/concepts.h:112:31: note: because 'char *' does not satisfy 'bidirectional_range'
  112 | concept random_access_range = bidirectional_range<_Tp> && random_access_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:109:31: note: because 'char *' does not satisfy 'forward_range'
  109 | concept bidirectional_range = forward_range<_Tp> && forward_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:106:25: note: because 'char *' does not satisfy 'input_range'
  106 | concept forward_range = input_range<_Tp> && forward_iterator<iterator_t<_Tp>>;
      |                         ^
../../third_party/libc++/src/include/__ranges/concepts.h:53:23: note: because 'char *' does not satisfy 'range'
   53 | concept input_range = range<_Tp> && input_iterator<iterator_t<_Tp>>;
      |                       ^
../../third_party/libc++/src/include/__ranges/concepts.h:48:3: note: because 'ranges::begin(__t)' would be invalid: call to deleted function call operator in type 'const __begin::__fn'
   48 |   ranges::begin(__t); // sometimes equality-preserving
      |   ^
../../base/containers/span.h:1017:13: note: candidate template ignored: constraints not satisfied [with R = char *]
 1017 |   constexpr span(R&& range)
      |             ^
../../base/containers/span.h:1014:14: note: because 'internal::CompatibleRange<element_type, char *>' evaluated to false
 1014 |     requires(internal::CompatibleRange<element_type, R> &&
      |              ^
../../base/containers/span.h:373:5: note: because 'char *' does not satisfy 'contiguous_range'
  373 |     std::ranges::contiguous_range<R> && std::ranges::sized_range<R> &&
      |     ^
../../third_party/libc++/src/include/__ranges/concepts.h:115:28: note: because 'char *' does not satisfy 'random_access_range'
  115 | concept contiguous_range = random_access_range<_Tp> && contiguous_iterator<iterator_t<_Tp>> && requires(_Tp& __t) {
      |                            ^
../../third_party/libc++/src/include/__ranges/concepts.h:112:31: note: because 'char *' does not satisfy 'bidirectional_range'
  112 | concept random_access_range = bidirectional_range<_Tp> && random_access_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:109:31: note: because 'char *' does not satisfy 'forward_range'
  109 | concept bidirectional_range = forward_range<_Tp> && forward_iterator<iterator_t<_Tp>>;
      |                               ^
../../third_party/libc++/src/include/__ranges/concepts.h:106:25: note: because 'char *' does not satisfy 'input_range'
  106 | concept forward_range = input_range<_Tp> && input_iterator<iterator_t<_Tp>>;
      |                         ^
../../third_party/libc++/src/include/__ranges/concepts.h:53:23: note: because 'char *' does not satisfy 'range'
   53 | concept input_range = range<_Tp> && input_iterator<iterator_t<_Tp>>;
      |                       ^
../../third_party/libc++/src/include/__ranges/concepts.h:48:3: note: because 'ranges::begin(__t)' would be invalid: call to deleted function call operator in type 'const __begin::__fn'
   48 |   ranges::begin(__t); // sometimes equality-preserving
      |   ^
../../base/containers/span.h:1038:13: note: candidate template ignored: could not match 'span<OtherElementType, OtherExtent, OtherInternalPtrType>' against 'char *'
 1038 |   constexpr span(
      |             ^
../../base/containers/span.h:1025:13: note: candidate constructor not viable: constraints not satisfied
 1025 |   constexpr span(std::initializer_list<value_type> il LIFETIME_BOUND)
      |             ^
../../base/containers/span.h:1026:14: note: because 'std::is_const_v<element_type>' evaluated to false
 1026 |     requires(std::is_const_v<element_type>)
      |              ^
../../net/websockets/websocket_inflater.h:85:32: note: passing argument to parameter 'dest' here
   85 |     void Read(base::span<char> dest, size_t size);
      |                                ^
1 error generated.