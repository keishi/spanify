# Build Failure Analysis: 2025_05_02_patch_342

## First error

../../base/strings/utf_string_conversions.cc:124:5: error: no matching function for call to 'UnicodeAppendUnsafe'
  124 |     UnicodeAppendUnsafe(dest, dest_len, code_point);
      |     ^~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `UnicodeAppendUnsafe` function, but failed to spanify a call site. The first error shows that `UnicodeAppendUnsafe` is called with `dest` which is `char16_t*` in that call site, but `UnicodeAppendUnsafe` now takes `base::span<Char>`.

## Solution
The rewriter should spanify the `dest` variable in the `DoUTFConversion` function.

```diff
--- a/base/strings/utf_string_conversions.cc
+++ b/base/strings/utf_string_conversions.cc
@@ -117,7 +117,7 @@ template <typename Char>
   requires(BitsAre<Char, 16>)
 void UnicodeAppendUnsafe(base::span<Char> out,
                          size_t* size,
-                         base_icu::UChar32 code_point) {
+                         base_icu::UChar32 code_point) {
   CBU16_APPEND_UNSAFE(out.data(), *size, code_point);
 }

```
## Note
The second error is the same as the first, just in a different call site.
```
../../base/strings/utf_string_conversions.cc:191:5: error: no matching function for call to 'UnicodeAppendUnsafe'
  191 |     UnicodeAppendUnsafe(dest, dest_len, code_point);
      |     ^~~~~~~~~~~~~~~~~~~