# Build Failure Analysis: 2025_05_02_patch_1665

## First error

../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:512:31: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
  512 |   DeleteFramebuffersHelper(n, framebuffers);
      |                               ^~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GLES2Implementation::DeleteFramebuffersHelper` was spanified, but the call site in `gles2_implementation_impl_autogen.h` was not updated to pass a span. It is still passing a raw pointer `const GLuint* framebuffers`, which cannot be implicitly converted to a `base::span<const GLuint>`.

## Solution
The rewriter needs to update the call site `DeleteFramebuffersHelper(n, framebuffers);` in `gles2_implementation_impl_autogen.h` to pass a span constructed from the raw pointer. The corrected call should look like:

```c++
DeleteFramebuffersHelper(n, base::span<const GLuint>(framebuffers, n));
```

## Note
`gles2_implementation_impl_autogen.h` is a generated file. This likely means the rewriter should avoid spanifying functions if it requires spanifying generated code.