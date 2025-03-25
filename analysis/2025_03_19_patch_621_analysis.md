# Build Failure Analysis: 2025_03_19_patch_621

## First error

../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:3112:31: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GenVertexArraysOESHelper` was spanified, but the call site in `GLES2Implementation::GenVertexArraysHelper` was not updated to pass a `base::span<const GLuint>`.  Instead, it is passing a raw `GLuint*`. The compiler is thus complaining about not being able to convert `GLuint*` to `base::span<const GLuint>`.

## Solution
The rewriter needs to spanify the call site in `GLES2Implementation::GenVertexArraysHelper` as well to pass in the correct type, but failed to do so.

The correct code should be

```c++
void GLES2Implementation::GenVertexArraysOESHelper(GLsizei n, const GLuint* arrays) {
  base::span<const GLuint> span_arrays(arrays, n);
  vertex_array_object_manager_->GenVertexArrays(n, span_arrays);
}
```

## Note
The same error applies to `DeleteVertexArraysOESHelper`.
```
../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:3141:34: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')