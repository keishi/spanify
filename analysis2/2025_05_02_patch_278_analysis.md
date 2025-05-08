# Build Failure Analysis: 2025_05_02_patch_278

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:310:19: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint>' (aka 'span<unsigned int>')
  310 |                   &reserved_ids_[0]);
      |                   ^~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `IdHandlerInterface::MakeIds` was spanified. The rewriter failed to recognize that `&reserved_ids_[0]` is a raw pointer that needs to be converted to a span. The rewriter has correctly converted `&client_id` to a span using `base::span<GLuint, 1>(&client_id, 1u)`. Thus it needs to do the same for this line, however the size is not available here since it is a member variable.

## Solution
When passing `&reserved_ids_[0]` to a spanified function, the rewriter should recognize this pattern and construct a span from the pointer and a size. Since the size is not available the rewriter can only construct a `base::span<GLuint>` without the size specified.

```c++
-                   &reserved_ids_[0]);
+                   base::span<GLuint>(reserved_ids_));
```

## Note
There are other similar errors in `gpu/command_buffer/client/gles2_implementation_impl_autogen.h` that need to be fixed as well. This is not a case where the size is unavailable, it's simply that the rewriter didn't attempt to rewrite those lines.