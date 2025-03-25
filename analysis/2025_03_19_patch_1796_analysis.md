```
# Build Failure Analysis: 2025_03_19_patch_1796

## First error

../../chrome/browser/sessions/session_restore_browsertest.cc:400:12: error: unused variable 'kUrls' [-Werror,-Wunused-const-variable]
  400 | const auto kUrls = std::to_array<const char*>({
      |            ^~~~~

## Category
Rewriter needs to avoid adding .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a C-style array `const char* const kUrls[]` to `std::array`. However the array is never actually used. Thus it is an unused variable. The rewriter isn't smart enough to identify this case and skip the transformation.

## Solution
The rewriter should not modify the code to convert `char[]` to `std::array` if it finds out that the resulting variable is unused. It can check for variable usage by AST matching.

## Note
The rewriter should skip this file entirely, because no code actually uses the spanified variable.