# Build Failure Analysis: 2025_03_14_patch_304

## First error

../../gpu/command_buffer/service/gl_utils.cc:382:10: error: no viable constructor or deduction guide for deduction of template arguments of 'span'
bool CheckUniqueAndNonNullIds(GLsizei n, base::span<const GLuint> client_ids) {

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `CheckUniqueAndNonNullIds`, but failed to spanify the call site in `GLContext`. The arguments passed in to the call site does not match the newly spanified function parameter.

## Solution
The rewriter should be more aggressive and also spanify call sites. It should identify all call sites and update accordingly.