# Build Failure Analysis: 24

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 4351, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 4357, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert `.data()` at offset 4357 while simultaneously rewriting `sizeof(buffer)` at offset 4351 to `(buffer.size() * sizeof(decltype(buffer)::value_type))`.  These edits overlap causing the tool to report conflicting replacements. This happens in the following line:

`data.assign(buffer.data(), base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer));`

## Solution
The rewriter should avoid generating overlapping replacements. This likely requires ensuring that RewriteArraySizeof does not rewrite the `sizeof` when the result of the array is later used to construct a `base::span`.

## Note
The build failure log only shows one error, so no other issues need classifying.