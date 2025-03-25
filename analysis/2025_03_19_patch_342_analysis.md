```
# Build Failure Analysis: 2025_03_19_patch_342

## First error

../../third_party/blink/renderer/core/css/css_selector.cc:715:61: error: member reference base type 'const NameToPseudoStruct[25]' is not a structure or union
  715 |     pseudo_type_map = std::begin(kPseudoTypeWithArgumentsMap.data());
      |                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is adding `.data()` to `kPseudoTypeWithArgumentsMap` and `kPseudoTypeWithoutArgumentsMap`.  It shouldn't be adding `.data()` unless it arrayifies something. The code is failing because std::begin/std::end already return pointers for C arrays.

## Solution
Remove the addition of `.data()` from `kPseudoTypeWithArgumentsMap` and `kPseudoTypeWithoutArgumentsMap`.  The span rewriter should not be adding `.data()` if it is already an array.