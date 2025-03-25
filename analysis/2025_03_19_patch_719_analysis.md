# Build Failure Analysis: 2025_03_19_patch_719

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 3083, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 3089, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to a `std::array` and simultaneously replace `sizeof(buffer)` with `buffer.size() * sizeof(decltype(buffer)::value_type)`.  These two replacements overlap, causing an error. The core issue here is that the rewriter has two separate AST matchers that operate on the same code region, leading to conflicting modifications. The diff shows that both replacements are being applied to the `buffer` variable.

## Solution
The rewriter needs to be modified to avoid overlapping replacements. This likely involves prioritizing one replacement over the other or combining them into a single, more comprehensive replacement. The rewriter could use a single matcher that identifies the need for both changes and applies them in a coordinated manner.

## Note
The error message clearly indicates the overlapping nature of the replacements and pinpoints the conflicting regions within the source file.