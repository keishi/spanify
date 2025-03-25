# Build Failure Analysis: 17

## First error

Overlapping replacements: ./media/filters/chunk_demuxer_unittest.cc at offset 160611, length 19: "(kCuesHeader.size() * sizeof(decltype(kCuesHeader)::value_type))" and offset 160617, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to replace `sizeof(kCuesHeader)` with `(kCuesHeader.size() * sizeof(decltype(kCuesHeader)::value_type))` and add `.data()` in the call to `data.insert`, but the replacements overlap. The overlapping replacement suggests that the rewriter first converted `kCuesHeader` to `std::array`, and then tried to calculate the size of it, but also needed to add `.data()` because it is being inserted into a std::vector.

## Solution
The rewriter needs to avoid overlapping replacements and should perform these two rewrites with awareness of each other.
Specifically, the size calculation should be aware of the `.data()` member or be rewritten to `.size()` on the std::array to avoid the second overlapping replacement.

## Note
The overlapping replacements bug is a common issue that can be improved in the rewriter.