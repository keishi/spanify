# Build Failure Analysis: 2025_03_19_patch_923

## First error

../../components/feedback/redaction_tool/url_canon_ip.cc:561:5: error: no matching function for call to '_itoa_s'
  561 |     _itoa_s(address[i], str, 10);
      |     ^~~~~~~
../../components/feedback/redaction_tool/url_canon_internal.h:92:12: note: candidate template ignored: could not match 'char[N]' against 'std::array<char, 16>'
   92 | inline int _itoa_s(int value, char (&buffer)[N], int radix) {
      |            ^
../../components/feedback/redaction_tool/url_canon_internal.h:88:5: note: candidate function not viable: requires 4 arguments, but 3 were provided
   88 | int _itoa_s(int value, char* buffer, size_t size_in_chars, int radix);
      |     ^       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The original code used a C-style array `char str[16];` with the `_itoa_s` function.  The rewriter changed this to `std::array<char, 16> str;`.  However, `_itoa_s` expects a `char*`, not a `std::array`.  The error indicates that the compiler cannot find a suitable `_itoa_s` overload for `std::array`. Adding .data() will resolve this issue.

## Solution
The rewriter should recognize this pattern where a `char[]` is converted to `std::array<char,16>` and then passed to a function. If that function expects a `char*`, the rewriter must append `.data()` to the variable name.

```c++
// Old
 _itoa_s(address[i], str, 10);

// New
 _itoa_s(address[i], str.data(), 10);