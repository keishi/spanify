# Build Failure Analysis: 2025_03_19_patch_919

## First error

../../components/feedback/redaction_tool/url_canon_ip.cc:131:18: error: no matching function for call to '_strtoui64'
  131 |   uint64_t num = _strtoui64(buf, nullptr, BaseForType(base));
      |                  ^~~~~~~~~~
../../components/feedback/redaction_tool/url_canon_internal.h:97:17: note: candidate function not viable: no known conversion from 'std::array<char, kMaxComponentLen + 1>' to 'const char *' for 1st argument
   97 | inline uint64_t _strtoui64(const char* nptr, char** endptr, int base) {
      |                 ^          ~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter replaced a C-style array `char buf[kMaxComponentLen + 1]` with `std::array<char, kMaxComponentLen + 1> buf`. However, the function `_strtoui64` (defined in `url_canon_internal.h`) expects a `const char*` as its first argument. The rewriter did not add `.data()` to `buf` when passing it to `_strtoui64`, resulting in a type mismatch error since `std::array` cannot be implicitly converted to `const char*`. The function `_strtoui64` is not third party code, because it is defined in the project, so this is a valid spanification.

## Solution
The rewriter should add `.data()` when passing the `std::array` variable `buf` to the function `_strtoui64`.

## Note
The rewriter should be updated to handle this scenario consistently.