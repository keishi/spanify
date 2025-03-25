# Build Failure Analysis: 2025_03_19_patch_628

## First error

../../gpu/command_buffer/client/gles2_implementation.cc:1198:25: error: no matching conversion for functional-style cast from 'GLint *' (aka 'int *') to 'base::span<GLint, 1>' (aka 'span<int, 1>')

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GetHelper` was spanified to take a `base::span<GLint>`, but the call sites were not updated to pass in a `base::span`. Instead, they are passing in `&value`, which is a `GLint*`. There is no implicit conversion from `GLint*` to `base::span<GLint, 1>`.

## Solution
The rewriter needs to be able to update call sites where a raw pointer is passed to a spanified function.
Replace `GetHelper(pname, base::span<GLint, 1>(&value))` with `GetHelper(pname, base::span<GLint, 1>(&value, 1))`

## Note
The error repeats for multiple call sites of `GetHelper`.