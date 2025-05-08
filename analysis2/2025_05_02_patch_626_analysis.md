# Build Failure Analysis: 2025_05_02_patch_626

## First error

Overlapping replacements: ./media/formats/mp4/box_reader_unittest.cc at offset 2600, length 16: "(kSkipBox.size() * sizeof(decltype(kSkipBox)::value_type))" and offset 2606, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to rewrite `sizeof(kSkipBox)` to `kSkipBox.size() * sizeof(decltype(kSkipBox)::value_type)`. At the same time, the rewriter is trying to add `.data()` to `kSkipBox` in the GetBuf function since it is being passed to the `std::vector` constructor. These rewrites are overlapping.

## Solution
The rewriter needs to avoid generating overlapping replacements. The rewrite of `sizeof` and adding `.data()` needs to be mutually exclusive.

## Note
None