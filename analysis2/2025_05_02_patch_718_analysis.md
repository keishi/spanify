# Build Failure Analysis: 2025_05_02_patch_718

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder.cc:16214:7: error: volatile lvalue reference to type 'const volatile Mailbox' cannot bind to a temporary of type 'const volatile Mailbox *'
 16214 |       reinterpret_cast<const volatile Mailbox*>(mailbox_data[0]));

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified the `mailbox_data` argument in `DoCreateAndTexStorage2DSharedImageINTERNAL`, but didn't update the `reinterpret_cast` to account for the span. The code is now trying to reinterpret cast a single byte `mailbox_data[0]` to a `Mailbox*` which is wrong.

## Solution
The rewriter needs to remove the indexing and use `mailbox_data.data()` so that the `reinterpret_cast` operates on the pointer contained within the span.

```diff
--- a/gpu/command_buffer/service/gles2_cmd_decoder.cc
+++ b/gpu/command_buffer/service/gles2_cmd_decoder.cc
-      reinterpret_cast<const volatile Mailbox*>(mailbox_data[0]));
+      reinterpret_cast<const volatile Mailbox*>(mailbox_data.data()));
```

## Note
The second error confirms the root cause. It shows that generated code is passing `mailbox` which is a `const volatile GLbyte*` into the spanified function `DoCreateAndTexStorage2DSharedImageINTERNAL` which takes a `base::span<const volatile GLbyte>`. This confirms the rewriter spanified the function, but didn't update the call site in the generated code.