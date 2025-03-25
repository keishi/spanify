# Build Failure Analysis: 2025_03_19_patch_73

## First error

Overlapping replacements: ./sandbox/linux/services/credentials.cc at offset 3270, length 8: ").subspan( sizeof)" and offset 3272, length 17: "(stack_buf.size() * sizeof(decltype(stack_buf)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to apply two conflicting replacements in close proximity. One replacement, likely from RewriteArraySizeof, wants to rewrite `sizeof(stack_buf)` to `(stack_buf.size() * sizeof(decltype(stack_buf)::value_type))`. The second replacement is from AppendDataCall, and it wants to add `.data()` to stack_buf. The sizeof rewrite generates code that includes parentheses. The AppendDataCall rewrite attempts to inject `.data()` at offset 3270 which is before the closing parenthesis.

## Solution
The rewriter needs to avoid generating overlapping replacements. The replacement logic in RewriteArraySizeof and AppendDataCall needs to be adjusted to avoid overlapping replacements. One possible solution is to ensure RewriteArraySizeof completes first, and then AppendDataCall only adds ".data()" after the entire RewriteArraySizeof replacement.

## Note
This is a very common bug and a high priority.