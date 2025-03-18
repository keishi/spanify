# Build Failure Analysis: 2025_03_15_patch_1423

## First error

../../third_party/blink/renderer/core/css/css_selector.cc:715:61: error: member reference base type 'const NameToPseudoStruct[25]' is not a structure or union
  715 |     pseudo_type_map = std::begin(kPseudoTypeWithArgumentsMap.data());
      |                                  ~~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `kPseudoTypeWithArgumentsMap` and `kPseudoTypeWithoutArgumentsMap` to `std::array`, but failed to remove the `.data()` call when passing them to `std::begin` and `std::end`. `std::begin` and `std::end` already accept `std::array` objects directly, so `.data()` is not needed. `kPseudoTypeWithArgumentsMap` and `kPseudoTypeWithoutArgumentsMap` are not third-party code so this does not violate that rule.

## Solution
The rewriter should not generate `.data()` when the array is passed to `std::begin` and `std::end`.

The following code:

```c++
pseudo_type_map = std::begin(kPseudoTypeWithArgumentsMap.data());
pseudo_type_map_end = std::end(kPseudoTypeWithArgumentsMap.data());
```

should be transformed into:

```c++
pseudo_type_map = std::begin(kPseudoTypeWithArgumentsMap);
pseudo_type_map_end = std::end(kPseudoTypeWithArgumentsMap);
```
## Note
The `IsPseudoMapSorted` function was converted to use `base::span` so the parameters changed in the diff. The function's logic is not the cause of the error.