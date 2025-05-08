```
# Build Failure Analysis: 2025_05_02_patch_33

## First error

Overlapping replacements: ./device/fido/cable/v2_handshake.cc at offset 37941, length 34: "(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))" and offset 37947, length 0: ".data()"

## Category
Overlapping replacements between RewriteArraySizeof and AppendDataCall.

## Reason
The rewriter is attempting to add `.data()` to `ephemeral_key_public_bytes` in the `out_response->insert` call, but it's also generating a replacement to rewrite `sizeof(ephemeral_key_public_bytes)` to `(ephemeral_key_public_bytes.size() * sizeof(decltype(ephemeral_key_public_bytes)::value_type))`. The `.data()` replacement is overlapping with the `RewriteArraySizeof` replacement, causing the error.  The problem happens in this section of the code.

```c++
   out_response->insert(
-      out_response->end(), ephemeral_key_public_bytes,
-      ephemeral_key_public_bytes + sizeof(ephemeral_key_public_bytes));
+      out_response->end(), ephemeral_key_public_bytes.data(),
+      base::span<uint8_t>(ephemeral_key_public_bytes ).subspan( sizeof).data()(ephemeral_key_public_bytes));

```

## Solution
The rewriter should avoid generating overlapping replacements. In this case, `ephemeral_key_public_bytes` is being rewritten from a C-style array to `std::array`. The rewriter is correctly adding `.data()` where needed. The fix would be to ensure that these two replacements are not generated for overlapping regions of code.  A simple solution would be to run these rewrites in separate clang passes.

## Note
The overlapping replacement is happening because the tool is trying to add `.data()` and also rewrite the `sizeof` expression. The second `out_response->insert` line looks wrong.
```c++
base::span<uint8_t>(ephemeral_key_public_bytes ).subspan( sizeof).data()(ephemeral_key_public_bytes));
```
It seems like this line should be removed.