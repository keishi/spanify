# Build Failure Analysis: 2025_03_19_patch_813

## First error

../../chrome/browser/companion/text_finder/text_highlighter_manager_unittest.cc:60:39: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   60 |         wc.get(), GURL(kBaseUrl.data().subspan(
      |                        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The original code used `kBaseUrl` as a `char[]` which can decay to `char*`. However after the change, `kBaseUrl` became `std::array<char, 25>`, so calling `kBaseUrl.data()` returns a `const char*`. Calling `.subspan()` on that pointer returns an error, because the replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place.

## Solution
Do not spanify `kBaseUrl` because it requires applying `subspan` to its return value, but the `return value` rewrite isn't there. Or, we can add it and make it smarter. The correct code would be to apply .data() at the end, not in the beginning.

## Note
The replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place.