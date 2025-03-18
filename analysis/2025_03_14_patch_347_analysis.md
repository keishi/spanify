# Build Failure Analysis: 2025_03_14_patch_347

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/es_descriptor_unittest.cc at offset 2165, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 2171, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first replaces `sizeof(buffer)` with `buffer.size() * sizeof(decltype(buffer)::value_type))` and then it tries to replace `buffer` with `buffer.data()`. Because the offsets of these replacements overlap, the tool fails.

## Solution
The rewriter should avoid applying multiple replacements to the same region of code. In this particular case, RewriteArraySizeof and AppendDataCall are conflicting. One solution is to avoid rewriting the `sizeof` operator when the underlying buffer is converted to std::array.

## Note
This is a classic overlapping replacements issue due to how the rewriter is implemented.