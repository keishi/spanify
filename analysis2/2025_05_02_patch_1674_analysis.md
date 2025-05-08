# Build Failure Analysis: 2025_05_02_patch_1674

## First error

../../gpu/command_buffer/client/gles2_implementation_autogen.h:285:45: error: non-virtual member function marked 'override' hides virtual member function

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter has changed the `name` parameter in `GetActiveAttrib` function from `char*` to `base::span<char>`. However, the rewriter did not update the signature in the parent classes. Specifically, the virtual function definition in `gpu::gles2::GLES2Interface` still expects a `char*`. This type mismatch causes the "hides virtual member function" error.

## Solution
The rewriter needs to update the function signatures of all parent classes where the spanified function is declared as virtual. In this specific case, it needs to update the function signature of `GetActiveAttrib` in `gpu::gles2::GLES2Interface` to use `base::span<char>`. The rewriter has to check and update other methods as well, like `GetActiveUniform`, `GetActiveUniformBlockName`, etc.