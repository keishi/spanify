# Build Failure Analysis: 2025_03_19_patch_1895

## First error
```
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1904:1: error: explicit instantiation of 'PatchGetNumericResults' does not refer to a function template, variable template, member function, member class, or static data member
 1904 | INSTANTIATE_PATCH_NUMERIC_RESULTS(GLint);
      | ^
```

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter has spanified the `PatchGetNumericResults` function, but it did not update the macro `INSTANTIATE_PATCH_NUMERIC_RESULTS` to match the new signature. The macro now needs to pass a `base::span<T>` instead of `T*`.

## Solution
The rewriter needs to recognize the `INSTANTIATE_PATCH_NUMERIC_RESULTS` macro and update it to properly construct a `base::span` from the raw pointer. Change the signature to accept a raw pointer and construct the span inline at the callsite within the macro.

## Note
The other errors are the same as the first error.
```
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1905:1: error: explicit instantiation of 'PatchGetNumericResults' does not refer to a function template, variable template, member function, member class, or static data member
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1906:1: error: explicit instantiation of 'PatchGetNumericResults' does not refer to a function template, variable template, member function, member class, or static data member
../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough.cc:1907:1: error: explicit instantiation of 'PatchGetNumericResults' does not refer to a function template, variable template, member function, member class, or static data member