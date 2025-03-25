# Build Failure Analysis: 2025_03_19_patch_169

## First error

Overlapping replacements: ./services/data_decoder/image_decoder_impl_unittest.cc at offset 5964, length 19: "(kRandomData.size() * sizeof(decltype(kRandomData)::value_type))" and offset 5970, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two replacements that overlap each other, resulting in a conflict. The first replacement seems to be related to rewriting `sizeof` operation on the `kRandomData` variable to determine the number of bytes of the data. And the second one attempts to add `.data()` to kRandomData to convert it to a C-style pointer that works with std::vector's constructor. Since kRandomData is `string_view` and not C-style array anymore, the sizeof calculation isn't applicable in the first place, and the rewriter should not attempt to rewrite it.

## Solution
The rewriter needs to avoid applying overlapping replacements. A possible solution is to prioritize the `.data()` replacement since it is closer to the intended outcome of using `base::span`, or to refine the AST matchers to avoid matching the sizeof expression when the variable is a string_view.

## Note
The error message includes "Applied 6 edits (1 errors)", which means that there are likely 5 other edits in the diff that were applied without issue. They are not analyzed in this report, but might be relevant in the future.