# Build Failure Analysis: 2025_03_14_patch_138

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/device/fido/cable/v2_handshake.cc at offset 32093, length 34: "(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))" and offset 32099, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to insert `.data()` at the end of the expression `(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))`, while simultaneously trying to rewrite the `sizeof` expression. This leads to overlapping replacements, as the rewriter tries to modify the same region of code in two different ways. The core issue is a conflict in which rewriters should apply in which context.

## Solution
The rewriter logic needs to avoid attempting to add `.data()` when it is already rewriting the surrounding expression. The rewriter should prioritize RewriteArraySizeof over AppendDataCall.

## Note
The error occurs when inserting into a handshake message. The rewriter correctly converted the declaration into a std::array, and added `.data()` for usage with noise_.MixHash and noise_.MixKey.