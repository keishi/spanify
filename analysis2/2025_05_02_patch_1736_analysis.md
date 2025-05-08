# Build Failure Analysis: 2025_05_02_patch_1736

## First error

../../url/url_canon_relative.cc:677:10: error: no matching function for call to 'DoIsRelativeURL'
  677 |   return DoIsRelativeURL<char>(
      |          ^~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_relative.cc:111:6: note: candidate function template not viable: no known conversion from 'const char *' to 'base::span<const char>' for 3rd argument
  111 | bool DoIsRelativeURL(const char* base,
      |      ^
  112 |                      const Parsed& base_parsed,
  113 |                      base::span<const CHAR> url,
      |                      ~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DoIsRelativeURL` was spanified. However, the call sites were not updated to pass a span. The error message indicates that the rewriter failed to convert the `const char*` argument to a `base::span<const char>`. The rewriter likely did not recognize that a raw pointer was being passed to a spanified function, or it failed to properly construct a span from the raw pointer at the call site.

## Solution
The rewriter needs to be able to identify raw pointers being passed to spanified functions and generate the necessary code to construct a span from the pointer and its size (if known). In this case, the rewriter should have wrapped `fragment` with `base::span<const char>(fragment, fragment_len)` at the call site.

## Note
The log includes a second error for `char16_t`.