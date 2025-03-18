# Build Failure Analysis: 2025_03_14_patch_1870

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/media/formats/mp4/aac_unittest.cc at offset 7308, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 7314, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first adds `.data()` to the `buffer` variable since it will be used in a span. Then it tries to compute the size of the array. But both replacements are overlapping.

## Solution
The fix is to avoid computing the array size if `.data()` is going to be appended to the expression.

## Note
There are no extra errors.