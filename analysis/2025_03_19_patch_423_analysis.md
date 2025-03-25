# Build Failure Analysis: 2025_03_19_patch_423

## First error

../../url/url_canon_ip.cc:163:7: error: no matching function for call to '_itoa_s'
  163 |       _itoa_s(x, str, 16);
      |       ^~~~~~~
../../url/url_canon_internal.h:593:12: note: candidate template ignored: could not match 'char[N]' against 'std::array<char, 5>'
  593 | inline int _itoa_s(int value, char (&buffer)[N], int radix) {
      |            ^
../../url/url_canon_internal.h:589:5: note: candidate function not viable: requires 4 arguments, but 3 were provided
  589 | int _itoa_s(int value, char* buffer, size_t size_in_chars, int radix);
      |     ^       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code uses `_itoa_s`, which expects a `char*` as the buffer, but after converting `char str[5]` to `std::array<char, 5> str`, the type is no longer a `char*`. There are two versions of `_itoa_s` in url/url_canon_internal.h. The compiler is trying to use a template version but it's unable to deduce N, and the non-template version expects 4 arguments, not 3.

## Solution
The rewriter needs to add `.data()` to the arrayified variable when it is passed to `_itoa_s`.

## Note
```
../../url/url_canon_ip.cc:157:7: void AppendIPv6Address(const unsigned char address[16], CanonOutput* output) {
   std::array<char, 5> str;
   _itoa_s(x, str.data(), 16);