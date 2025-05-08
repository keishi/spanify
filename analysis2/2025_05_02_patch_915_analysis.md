# Build Failure Analysis: 2025_05_02_patch_915

## First error

../../base/i18n/streaming_utf8_validator_unittest.cc:135:38: error: no matching function for call to 'end'
  135 | const char* const* const valid_end = std::end(valid.data());
      |                                      ^~~~~~~~

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter converted `valid` from `const char* const valid[]` to `std::to_array<const char*>`. However, the `std::end` function used with `valid.data()` is failing to compile because `std::end` expects a C-style array or a container with `.begin()` and `.end()` methods. Since `std::to_array` returns an array, using `.data()` returns a raw pointer, but `std::end` is not defined to be called on raw pointers.

## Solution
The rewriter failed to add `.data()` to a spanified return value. This pattern must be detected by the rewriter.

```diff
--- a/base/i18n/streaming_utf8_validator_unittest.cc b/base/i18n/streaming_utf8_validator_unittest.cc
+++ b/base/i18n/streaming_utf8_validator_unittest.cc
@@ -125,12 +127,12 @@ TEST_F(StreamingUtf8ValidatorThoroughTest, DISABLED_TestEverything) {
 // All of the strings in |valid| must represent a single codepoint, because
 // partial sequences are constructed by taking non-empty prefixes of these
 // strings.
-const char* const valid[] = {
+const auto valid = std::to_array<const char*>({
     "\r",           "\n", "a", "\xc2\x81", "\xe1\x80\xbf", "\xf1\x80\xa0\xbf",
     "\xef\xbb\xbf",  // UTF-8 BOM
-};
+});
 
-const char* const* const valid_end = std::end(valid);
+const char* const* const valid_end = std::end(valid.data());

 const char* const invalid[] = {
     // always invalid bytes
```

## Note
The rewriter converted the original C-style array `valid` to a `std::array` using `std::to_array`, and then used `valid.data()` to obtain a raw pointer to the underlying array. This is then passed to `std::end()`. `std::end()` has overloads to deal with raw arrays directly so we do not need to call `.data()` at all here. The correct code would be `const char* const* const valid_end = std::end(valid);`.

The rewriter also introduced subsequent errors because the rewriter failed to properly apply `.data()` to all arguments of type `const char* const*` when calling the methods `CheckRange`, `CheckRangeByteAtATime`, `CheckCombinations`.