# Build Failure Analysis: 2025_03_14_patch_311

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1904:1: error: explicit instantiation of 'PatchGetNumericResults' does not refer to a function template, variable template, member function, member class, or static data member

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the `PatchGetNumericResults` function which is part of a class that excludes unsafe buffers, indicated by the `#ifdef UNSAFE_BUFFERS_BUILD` block and `#pragma allow_unsafe_buffers` pragma. The rewriter is creating explicit template instantiations of this function which are now invalid since the function's parameter type has been changed to `base::span` and thus unsafe code is being used.

## Solution
The rewriter should avoid spanifying functions when those functions are defined inside a `#ifdef UNSAFE_BUFFERS_BUILD` block and/or are excluded with `#pragma allow_unsafe_buffers`.

## Note
Other errors in the log are cascading errors stemming from the first error. All of the errors mention that the candidate template could not match `base::span<T>` against a raw pointer type (e.g. `GLint*`, `GLfloat*`).