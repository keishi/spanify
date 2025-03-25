# Build Failure Analysis: 2025_03_19_patch_37

## First error

Overlapping replacements: ./device/fido/cable/v2_handshake.cc at offset 32110, length 34: "(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))" and offset 32116, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite `sizeof(ephemeral_key_public_bytes)` to `(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))` and at the same time it wants to add `.data()` to `ephemeral_key_public_bytes` when inserting it to the vector. Both replacements are trying to modify the same area, creating a conflict.

## Solution
The rewriter should avoid applying both rewrites to the same expression. The rewriter needs to be smarter about not creating conflicting rewrites.

## Note
The rewriter changed a C-style array to `std::array` and then tried to insert it into a `std::vector` but failed to handle the edge cases. It also generated invalid code.