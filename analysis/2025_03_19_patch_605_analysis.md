# Build Failure Analysis: 2025_03_19_patch_605

## First error

Overlapping replacements: ./media/formats/mp4/es_descriptor_unittest.cc at offset 800, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 806, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite the `sizeof(buffer)` expression to calculate the size of the array, but it's also trying to append `.data()` to the `buffer` variable. The `.data()` replacement is overlapping the `sizeof` replacement, causing a conflict.

## Solution
The rewriter logic for `RewriteArraySizeof` and `AppendDataCall` needs to be adjusted so that they don't generate overlapping replacements. Likely, the `AppendDataCall` rewriter pass should be skipped entirely when the `RewriteArraySizeof` pass is also modifying the same variable. Alternatively the replacements generated from `AppendDataCall` can be updated such that it does not overlap the size calculation replacement.

## Note
The build failure log only shows one error, so this is the only issue.