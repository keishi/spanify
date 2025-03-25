# Build Failure Analysis: 2025_03_19_patch_727

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 6515, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 6521, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter generated two replacements that overlap. The first replacement attempts to calculate the size of the buffer: `(buffer.size() * sizeof(decltype(buffer)::value_type))`. The second replacement adds `.data()` after `buffer`: `.data()`. Since `.data()` needs to be called when passing a std::array to a third_party function, it is generating this `.data()` call. But a bug in the rewriter caused this `.data()` call to overlap with the `size()` replacement.

## Solution
The rewriter needs to avoid generating overlapping replacements. Likely the rewriter needs to be smarter about not calling `.data()` if it is already rewriting the size.

## Note
N/A