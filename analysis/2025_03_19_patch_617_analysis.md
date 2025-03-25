# Build Failure Analysis: 2025_03_19_patch_617

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:310:19: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<GLuint>' (aka 'span<unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `MakeIds` is now spanified: `virtual void MakeIds(GLES2Implementation* gl_impl, GLuint id_offset, GLsizei n, base::span<GLuint> ids) = 0;`. The code is calling this spanified function with a raw pointer, but the rewriter failed to recognize that `&client_id` is effectively the same as a raw pointer with size 1 and thus is a valid `base::span<GLuint,1>`.

## Solution
The rewriter should be able to recognize raw pointers with size information for parameters that are now spans.

Example:
```c++
-  GetIdHandler(SharedIdNamespaces::kTextures)->MakeIds(this, 0, 1, &client_id);
+  GetIdHandler(SharedIdNamespaces::kTextures)->MakeIds(this, 0, 1, base::span<GLuint, 1>(&client_id));
```

## Note
There are other errors in the build log of the same kind.