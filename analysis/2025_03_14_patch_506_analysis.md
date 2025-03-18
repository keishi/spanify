# Build Failure Analysis: 2025_03_14_patch_506

## First error

../../components/headless/screen_info/headless_screen_info.cc:83:45: error: member reference base type 'const value_type *' (aka 'const char *') is not a structure or union
   83 |       return kInvalidScreenColorDepth.data().subspan(std)::string(value);
      |              ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~

## Category
Conflict between ".data()" and ".subspan()" replacements.

## Reason
The rewriter converted `kInvalidScreenColorDepth` to `std::array` and added `.data()` to it. Then it tried to add `.subspan()` to the result of `.data()`. However, the syntax is incorrect: `kInvalidScreenColorDepth.data().subspan(std)::string(value)`

## Solution
The rewriter replacements for ".data()" and ".subspan()" are conflicting and placed in the wrong place.

## Note
There are other errors in the log after this.