# Build Failure Analysis: 2025_03_14_patch_1860

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/aac_unittest.cc at offset 3083, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 3089, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements in the same area of the file, causing a conflict. The first replacement attempts to replace `sizeof(buffer)` with `(buffer.size() * sizeof(decltype(buffer)::value_type))` while the second replacement attempts to insert `.data()` after `buffer` The overlap happened because the size replacement calculation uses `buffer.size()` and a later transformation attempts to use `.data()` on `buffer` for the data vector.

## Solution
The rewriter should avoid this conflict by checking for overlapping replacements or applying the replacements in a specific order that avoids conflicts.

## Note
The conflicting replacements occur when converting a C-style array to `std::array` and then assigning it to a `std::vector`. The rewriter attempts to convert `buffer` to a `std::array`, and also add `.data()` for the vector.