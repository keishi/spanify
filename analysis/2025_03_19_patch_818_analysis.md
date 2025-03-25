# Build Failure Analysis: 2025_03_19_patch_818

## First error

../../gpu/command_buffer/client/raster_implementation.cc:60:29: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DeleteQueriesEXTHelper` was spanified, but the call site in `raster_implementation_impl_autogen.h` is passing a raw pointer (`const GLuint*`) to the `queries` argument. The spanified function expects a `base::span<const GLuint>`. The rewriter failed to recognize this size info unavailable rhs value and rewrite the argument into a span.

## Solution
The rewriter needs to recognize cases where a raw pointer is passed to a spanified function and generate appropriate code to create a span from the raw pointer.

```c++
base::span<const GLuint> queries_span(queries, n);
DeleteQueriesEXTHelper(n, queries_span);
```

## Note
The error occurs in generated code, so the rewriter needs to avoid spanifying functions that will cause errors in generated code. This might fall under the category: Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.
```
gles2_cmd_decoder_autogen.h is generated code, so it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.