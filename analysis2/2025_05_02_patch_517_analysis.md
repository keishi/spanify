# Build Failure Analysis: 2025_05_02_patch_517

## First error
../../ui/base/l10n/l10n_util.cc:334:58: error: member reference base type 'const char *const[57]' is not a structure or union
  334 |     return std::binary_search(std::begin(kPlatformLocales.data()),
      |                                          ~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code attempts to use `kPlatformLocales.data()` as the first argument to `std::binary_search`. `kPlatformLocales` is a C-style array. The rewriter is supposed to add `.data()` in `ui/base/l10n/l10n_util.cc` at line 334 to use `std::begin(kPlatformLocales)` rather than `std::begin(kPlatformLocales.data())`.

## Solution
The rewriter needs to add `.data()` to the first argument of `std::binary_search` when using a C-style array.
```
#include <algorithm>

const char* arr[] = {"a", "b", "c"};
int main() {
  bool found = std::binary_search(std::begin(arr), std::end(arr), "b");
  return 0;
}
```

## Note
The return type of `GetPlatformLocalesForTesting()` was changed to `base::span<char* const>`. The compiler error shows that a `const char *const[57]` cannot be converted to a `base::span<char* const>`. The rewriter should also generate `base::span<const char* const>` to fix this error.
```
# Build Failure Analysis: 2025_05_02_patch_517

## First error
../../ui/base/l10n/l10n_util.cc:334:58: error: member reference base type 'const char *const[57]' is not a structure or union
  334 |     return std::binary_search(std::begin(kPlatformLocales.data()),
      |                                          ~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter failed to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code attempts to use `kPlatformLocales.data()` as the first argument to `std::binary_search`. `kPlatformLocales` is a C-style array, which was converted to `std::array`. The rewriter needs to rewrite the code to use `std::begin(kPlatformLocales)`, since the compiler error comes from accessing `.data()` member.

## Solution
The rewriter needs to recognize this pattern where a converted C-style array to `std::array` variable is being passed to `std::begin` or `std::end`, and remove `.data()`.

## Note
The return type of `GetPlatformLocalesForTesting()` was changed to `base::span<char* const>`. The compiler error shows that a `const char *const[57]` cannot be converted to a `base::span<char* const>`. The rewriter should also generate `base::span<const char* const>` to fix this error.