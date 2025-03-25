# Build Failure Analysis: 1709

## First error

../../net/base/chunked_upload_data_stream_unittest.cc:67:21: error: no matching function for call to 'byte_span_from_cstring'
   67 |   stream.AppendData(base::byte_span_from_cstring(kTestData), true);
      |                     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1631:16: note: candidate template ignored: could not match 'const CharT[Extent]' against 'const std::array<char, 11>'
 1631 | constexpr auto byte_span_from_cstring(const CharT (&str LIFETIME_BOUND)[Extent])
      |                ^

## Category
Rewriter needs to handle conversion of `std::array` to `base::span` correctly.

## Reason
The rewriter changed `kTestData` from a C-style array to `std::array`. However, `base::byte_span_from_cstring` expects a C-style array as input, not a `std::array`. The error message indicates that the template argument deduction failed because the type of `kTestData` (which is `std::array<char, 11>`) does not match the expected type (which is `const CharT (&str LIFETIME_BOUND)[Extent]`).

## Solution
The rewriter needs to use `.data()` to pass the underlying C-style array of the `std::array` to `base::byte_span_from_cstring`. The fix is to change `base::byte_span_from_cstring(kTestData)` to `base::byte_span_from_cstring(kTestData.data())`.

## Note
There are many other errors that are of the same type, thus this fix should resolve most errors.