# Build Failure Analysis: 2025_03_19_patch_781

## First error

../../components/headless/screen_info/headless_screen_info.cc:165:37: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter is attempting to apply both `.data()` and `.subspan()` to what was originally a `char[]`. However, the resulting code is invalid. The `.data()` replacement is happening first, resulting in a `const char*` and then `.subspan()` is incorrectly being applied as if the rewriter believed it was a `std::array`.

## Solution
The rewriter should be smarter about how it applies replacements. It should understand that when a `char[]` is converted to a `std::array` and then `.data()` is called, calling `.subspan()` afterwards is not correct. Likely the rewriter is generating `.data()` in one Clang pass, and then another pass comes along and tries to spanify the resulting `.data()`.

## Note
The root cause is not obvious from the diff because it is just showing what code changed, but not the intermediate states that the clang rewriter generated.