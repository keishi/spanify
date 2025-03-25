# Build Failure Analysis: 2025_03_19_patch_38

## First error
Overlapping replacements: ./device/fido/cable/v2_handshake.cc at offset 37916, length 34: "(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))" and offset 37922, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter first replaced `sizeof(ephemeral_key_public_bytes)` with `(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))` and then attempted to add `.data()` to `ephemeral_key_public_bytes` resulting in overlapping replacements.

## Solution
The rewriter should avoid applying two replacements that overlap each other. In this particular case, the rewriter should likely run array size replacements before append .data() replacements.

## Note
The overlapping replacement happened due to overlapping ranges created by `RewriteArraySizeof` and `AppendDataCall` replacements.