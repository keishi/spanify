# Build Failure Analysis: 2025_03_19_patch_1287

## First error

../../content/browser/devtools/protocol/webauthn_handler.cc:343:13: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
  343 |             .subspan(base::NumberToString(device::kUserHandleMaxLength))

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter added `.data()` to a `std::array<char, 45>` named `kInvalidUserHandle` and then tried to call `.subspan()` on the result. `.subspan()` is meant to be called on `base::span` objects, not on raw character pointers. The replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place.

## Solution
The rewriter should avoid adding `.data()` to a variable if `.subspan()` is called on it. Or, conversely, if `.data()` is added, the subsequent `.subspan()` call needs to be adjusted to work with the underlying raw pointer.

## Note
The error occurred because the rewriter blindly adds `.data()` to make a variable compatible with a function that expects a `base::span`, without considering other operations that might be performed on the variable.