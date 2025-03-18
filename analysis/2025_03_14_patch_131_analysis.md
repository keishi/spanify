# Build Failure Analysis: 131

## First error

../../components/password_manager/core/browser/ui/passwords_grouper.cc:61:54: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   61 |   std::string query = kFallbackIconQueryParams.data().subspan(
      |                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The code uses `kFallbackIconQueryParams.data().subspan()` to create a substring of the `kFallbackIconQueryParams` string, but after the rewriter changes `kFallbackIconQueryParams` from `char[]` to `std::array<char, 89>`, it fails to insert `.data()` after `kFallbackIconQueryParams`, resulting in an attempt to call `subspan` on an `std::array` directly which is incorrect, and thus the compile error.

## Solution
The replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place. Need to rewrite the rule so that both replacements are inserted at the correct locations.

## Note
The stack trace for this failure is:
```
../../components/password_manager/core/browser/ui/passwords_grouper.cc:61:54: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   61 |   std::string query = kFallbackIconQueryParams.data().subspan(
      |                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~