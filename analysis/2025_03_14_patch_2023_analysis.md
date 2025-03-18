# Build Failure Analysis: 2025_03_14_patch_2023

## First error

../../chrome/browser/autocomplete/search_provider_unittest.cc:3434:13: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  3434 |         { { "a", "", AutocompleteMatchType::SEARCH_WHAT_YOU_TYPED },
      |             ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
      |             {                                                    }

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The compiler is suggesting to add braces around the initialization of a
subobject. It looks like the rewriter is trying to convert a C-style array to
`std::array`. However, the initialization of the subobject is not handled
correctly, leading to the compiler suggesting braces. This is happening because
of a conflict in replacement ranges. The `RewriteArraySizeof` and
`AppendDataCall` replacements are trying to modify the same region of code
simultaneously, leading to overlapping replacements.

## Solution
The rewriter should avoid overlapping replacements when converting a C-style
array to `std::array`. This can be achieved by ensuring that the replacements
are applied in a specific order or by adjusting the replacement ranges to avoid
conflicts. In this specific case, adding a length check to RewriteArraySizeof
so it skips these declarations should resolve the overlapping replacements.

## Note
There are more errors in the build log indicating the same issue occurs at other
locations.
```