# Build Failure Analysis: 2025_05_02_patch_1436

## First error

Overlapping replacements: ./media/formats/mp4/aac_unittest.cc at offset 4351, length 14: "(buffer.size() * sizeof(decltype(buffer)::value_type))" and offset 4357, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The error message "Overlapping replacements" indicates that the rewriter is attempting to make two conflicting changes to the same area of code. In this case, it's trying to both rewrite `sizeof(buffer)` to `buffer.size() * sizeof(decltype(buffer)::value_type)` and also add `.data()` to the `buffer` variable.

The original code used `sizeof(buffer)` to determine the size of the `buffer` array. The spanify tool converted `buffer` to `std::array`, but also attempted to append `.data()` to it. Both of these operations try to modify the original `buffer` variable resulting in conflicting replacements.

## Solution
The rewriter logic needs to avoid applying both `RewriteArraySizeof` and `AppendDataCall` rewrites to the same variable. When rewriting `sizeof(buffer)` where `buffer` is converted to `std::array`, the rewriter should understand that `.data()` might need to be added elsewhere, but avoid overlapping replacements.

Specifically in the given example, the tool tried to generate this:
`base::span<uint8_t>(buffer ).subspan( sizeof).data()(buffer)`
which is clearly incorrect.

The rewriter should be smart enough to realize `sizeof` on a local array converted to `std::array` is not what was intended in the original code.

## Note
This is a common error pattern that arises from the rewriter making multiple passes and not properly coordinating the replacements. It needs a more sophisticated approach to avoid conflicting changes.