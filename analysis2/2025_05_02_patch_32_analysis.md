# Build Failure Analysis: 2025_05_02_patch_32

## First error

Overlapping replacements: ./device/fido/cable/v2_handshake.cc at offset 32135, length 34: "(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))" and offset 32141, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to add `.data()` to `ephemeral_key_public_bytes` in one replacement, while simultaneously generating a `RewriteArraySizeof` replacement that calculates the size of the same array.  The `.data()` replacement is inserted at the end of the array variable name. However, the `RewriteArraySizeof` replacement is much larger, encompassing a wider portion of the code, including the location where `.data()` is to be added.

## Solution
The rewriter needs to avoid applying both RewriteArraySizeof and AppendDataCall on the same variable, or ensure that the replacements do not overlap.  Specifically, the logic for inserting `.data()` should account for the presence of the RewriteArraySizeof replacement, or vice versa. A possible solution could be to apply RewriteArraySizeof *after* AppendDataCall, so that its range includes the `.data()` call.

## Note
The overlapping replacements prevent the build from completing successfully.