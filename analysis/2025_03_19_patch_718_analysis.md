# Build Failure Analysis: 2025_03_19_patch_718

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 2410, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2416, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempted to add `.data()` to the array `buffer` after converting it to `std::array`. At the same time, it tried to replace `sizeof(buffer)` with `(buffer.size() * sizeof(decltype(buffer)::value_type))`. Because these replacements overlap, the rewriter crashed.

## Solution
The rewriter should avoid generating overlapping replacements. In this particular case, adding `.data()` is not needed when assigning the `std::array` to `std::vector`, since `.assign()` already takes care of that.

## Note
The error message clearly indicates the overlapping replacements and the affected file. This helps pinpoint the exact location of the issue.