# Build Failure Analysis: 2025_03_16_patch_1426

## First error

Overlapping replacements: /usr/local/google/home/nuskos/chromium-team/chromium/src/device/bluetooth/floss/floss_adapter_client_unittest.cc at offset 43259, length 18: "(kFakeBytes.size() * sizeof(decltype(kFakeBytes)::value_type))" and offset 43265, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter attempts to rewrite both the `sizeof` expression and add `.data()` to the spanified `kFakeBytes` at the same time, but the size rewriting inserts code into the middle of the replacement for `.data()`, causing the replacements to overlap and thus be invalid.

## Solution
The rewriter needs to avoid attempting both rewrites at the same time. This can be done by making the rewrites mutually exclusive or by ensuring that the size rewrite doesn't interfere with the `.data()` rewrite.

## Note