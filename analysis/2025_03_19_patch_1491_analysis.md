# Build Failure Analysis: 1423

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_autogen.h:4642:36: error: no viable conversion from 'GLuint *' (aka 'unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GenVertexArraysOESHelper` was spanified to take a `base::span<const GLuint>` as input, but the call site in `DoGenVertexArraysOES` passes a raw pointer `arrays_safe`. The rewriter failed to spanify the call site.

## Solution
The rewriter should be able to spanify the call site by wrapping the raw pointer with `base::span`, and passing the length of the pointer argument.

```c++
-      !GenVertexArraysOESHelper(n, arrays_safe)) {
+      !GenVertexArraysOESHelper(n, base::span(arrays_safe, n))) {
```

## Note
The rewriter spanified a function, but failed to spanify a call site.