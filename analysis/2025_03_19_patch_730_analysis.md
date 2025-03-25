# Build Failure Analysis: 2025_03_19_patch_730

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 8047, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 8053, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add ".data()" to the `buffer` variable (now a `std::array`) while also generating code to calculate the buffer size. This results in overlapping replacements, specifically when trying to calculate the size of the array for the `base::span` constructor and appending `.data()` for the `memcmp` function call.

## Solution
The rewriter needs to avoid generating overlapping replacements when dealing with `std::array` variables. It should correctly handle both the `.data()` call and the buffer size calculation without causing conflicts.

## Note
The overlapping replacements indicate that the rewriter is generating code to pass `buffer.size() * sizeof(decltype(buffer)::value_type)` as the size argument to something. This likely happens in conjunction with the `.subspan()` method call. This means the rewriter is attempting to use both `.data()` and the size calculation to get the raw pointer, which is incorrect.

The error message indicates an overlap with an offset at 8053, which corresponds to `.data()`. The first replacement `(buffer.size() * sizeof(decltype(buffer)::value_type))` is likely the size calculation.