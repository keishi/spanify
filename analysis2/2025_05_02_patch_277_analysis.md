# Build Failure Analysis: 2025_05_02_patch_277

## First error

../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:489:26: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `DeleteBuffersHelper`, `DeleteRenderbuffersHelper`, `DeleteSamplersHelper`, `DeleteTexturesHelper` functions, but failed to spanify call sites passing raw pointers. The error message indicates that there's no viable conversion from `const GLuint*` to `base::span<const GLuint>`. The rewriter didn't recognize this pattern and generate a span from the raw pointer.

## Solution
The rewriter needs to spanify the call sites to the spanified functions, creating a `base::span` from the raw pointer and the known size.

For example in this case, the rewriter should replace this:
```c++
DeleteBuffersHelper(n, buffers);
```
with this:
```c++
DeleteBuffersHelper(n, base::span(buffers, n));
```

## Note
Multiple functions were spanified but not their call sites:
- `DeleteRenderbuffersHelper`
- `DeleteSamplersHelper`
- `DeleteTexturesHelper`