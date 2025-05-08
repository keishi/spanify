# Build Failure Analysis: 2025_05_02_patch_1098

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough_doers.cc:1462:10: error: no matching function for call to 'GenHelper'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GenHelper` has been spanified but the call sites in `gles2_cmd_decoder_passthrough_doers.cc` are passing a `volatile GLuint*` instead of a `base::span<const volatile GLuint>`. The rewriter failed to update the call sites to convert the raw pointer to a span.

## Solution
The rewriter needs to update the call sites of the `GenHelper` function to pass a `base::span<const volatile GLuint>` instead of a `volatile GLuint*`. This will require creating a span from the raw pointer and the count `n`.

## Note
There are many call sites that need to be spanified. The category Pointer passed into spanified function parameter can be used for all of these.