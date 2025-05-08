# Build Failure Analysis: 2025_05_02_patch_1685

## First error

../../url/url_canon_ip.cc:128:5: error: no matching function for call to '_itoa_s'
  128 |     _itoa_s(address[i], str, 10);
      |     ^~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The `_itoa_s` function is being called with a `std::array<char, 16>` as the buffer argument (`str`). However, `_itoa_s` expects a `char*` (or a `char(&)[N]` in one overload), not a `std::array`. The rewriter failed to recognize that `str` was converted from a C-style array to `std::array`, and did not add `.data()` when passed to `_itoa_s`.

Note that even though `_itoa_s` is not a third party function, the rule about needing to add `.data()` still applies. The important thing is that the function's argument type is `char*`, and the rewriter needs to implicitly convert a spanified `char[]` variable to `char*` by adding `.data()`.

## Solution
Modify the rewriter to detect when a `std::array<char, N>` (originally `char[]`) is being used as an argument to a function expecting a `char*`. In these cases, append `.data()` to the `std::array` variable.

For example, the code should be rewritten as follows:

```diff
-    _itoa_s(address[i], str, 10);
+    _itoa_s(address[i], str.data(), 10);
```

## Note
The `url_canon_internal.h` has two overloads for `_itoa_s`. One is `int _itoa_s(int value, char (&buffer)[N], int radix)` which takes in `char (&buffer)[N]` as the second argument. This overload is not viable because the second argument `str` is `std::array<char, 16>`, not `char[]`. The other overload `int _itoa_s(int value, char* buffer, size_t size_in_chars, int radix)` requires 4 arguments, not 3.