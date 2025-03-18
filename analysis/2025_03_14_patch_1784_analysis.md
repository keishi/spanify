# Build Failure Analysis: 2025_03_14_patch_1784

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:630:37: error: no viable conversion from 'const GLuint *' (aka 'const unsigned int *') to 'base::span<const GLuint>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to add .data() when calling spanified functions with C-style arrays.

## Reason
The rewriter converted the `transformfeedbacks` parameter of `DeleteTransformFeedbacksHelper` to `base::span<const GLuint>`.  However, the call site in `gles2_implementation_impl_autogen.h` passes a raw `GLuint*` array to this function. There is no implicit conversion from a raw array to a `base::span`. The fix involves explicitly calling `.data()` on the raw array to convert it to a pointer, which can then be implicitly converted to a span.

## Solution
The rewriter needs to be updated to automatically insert `.data()` when passing a raw array to a function that now expects a `base::span`. The logic would look like this:

1.  Identify call sites to functions that have been modified to accept `base::span` arguments.
2.  Check if the argument being passed is a raw array (e.g., `GLuint*`).
3.  If so, append `.data()` to the argument expression.

In this specific case, change:

```c++
helper_->DeleteTransformFeedbacksImmediate(n, ids);
```

to:

```c++
helper_->DeleteTransformFeedbacksImmediate(n, ids.data());
```

## Note
This failure uncovers a missing feature to automatically call `.data()` when calling spanified functions with C style arrays. The rewriter needs to do this automatically.