# Build Failure Analysis: 2025_05_02_patch_1666

## First error

../../gpu/command_buffer/client/gles2_implementation_impl_autogen.h:630:37: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')
  630 |   DeleteTransformFeedbacksHelper(n, ids);
      |                                     ^~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `DeleteTransformFeedbacksHelper` was spanified, but the call site in `GLES2Implementation::DeleteTransformFeedbacks` passes a raw pointer `ids` where the size is known from parameter `n`. This seems to be a bug with the rewriter where it failed to recognize the size info available.
The declaration for `DeleteTransformFeedbacksHelper` is as follows:

```c++
  void DeleteTransformFeedbacksHelper(
      GLsizei n,
      base::span<const GLuint> transformfeedbacks);
```

The call site is as follows:

```c++
  DeleteTransformFeedbacksHelper(n, ids);
```

## Solution
The rewriter should recognize this pattern and wrap the raw pointer with a span. The rewriter should generate code as follows.
```c++
  DeleteTransformFeedbacksHelper(n, base::span<const GLuint>(ids, n));
```

## Note
```