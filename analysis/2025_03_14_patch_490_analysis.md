# Build Failure Analysis: 2025_03_14_patch_490

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/sandbox/linux/services/credentials.cc at offset 3270, length 8: ").subspan( sizeof)" and offset 3272, length 17: "(stack_buf.size() * sizeof(decltype(stack_buf)::value_type))"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to the arrayified variable, and then adds `.subspan` later. This results in an overlap.

## Solution
RewriteArraySizeof should be aware of AppendDataCall so it does not try to rewrite code that will be rewritten later.

## Note
None