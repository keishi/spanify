# Build Failure Analysis: 2025_03_19_patch_618

## First error

../../gpu/command_buffer/client/share_group.cc:71:30: error: no viable conversion from 'base::span<const GLuint>' (aka 'span<const unsigned int>') to 'const GLuint *' (aka 'const unsigned int *')
   71 |     (gl_impl->*delete_fn)(n, ids);
      |                              ^~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. Specifically, `FreeIds` expects `base::span<const GLuint>`, but `DeleteBuffersHelper` is passing `const GLuint* buffers`.

## Solution
The rewriter needs to convert `const GLuint*` to `base::span<const GLuint>` at the call site. For example, in `GLES2Implementation::DeleteBuffersHelper`, the rewriter should replace:

```c++
(gl_impl->*delete_fn)(n, ids);
```

with

```c++
(gl_impl->*delete_fn)(n, base::span(ids,n));
```

## Note
This error occurs in multiple places, but they all have the same root cause and solution.