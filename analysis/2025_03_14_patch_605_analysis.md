# Build Failure Analysis: 2025_03_14_patch_605

## First error

../../content/browser/devtools/protocol/webauthn_handler.cc:343:13: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  342 |         kInvalidUserHandle.data()
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~
  343 |             .subspan(base::NumberToString(device::kUserHandleMaxLength))
      |             ^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The code uses `std::array<char, 45> kInvalidUserHandle`. The rewriter incorrectly added `.data()` to it and then also attempted to call `.subspan()` on the result of `.data()`. The `.subspan()` method is intended to be called on a `base::span` object, not a raw pointer. The error message indicates that the type before `.subspan` is `const value_type *` which is `const char *`, a primitive type. 

## Solution
The rewriter logic should be updated to avoid adding `.data()` to `std::array` variables when `.subspan()` is also intended to be called on the same variable. Also it should call `.data()` last to avoid such chained replacements.

## Note
The diff shows the rewriter converted the original C-style string literal to a `std::array`. It then attempted to use `.subspan()` on the data pointer obtained from `.data()`, resulting in this error.