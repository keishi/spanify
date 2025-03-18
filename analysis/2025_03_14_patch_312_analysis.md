# Build Failure Analysis: 2025_03_14_patch_312

## First error

../../gpu/command_buffer/service/gles2_cmd_decoder_passthrough_doers.cc:1671:3: error: no matching member function for call to 'PatchGetBufferResults'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `PatchGetBufferResults`, but failed to spanify the call site.

## Solution
The call sites in `gles2_cmd_decoder_passthrough_doers.cc` need to be updated to use `base::span`.

```c++
   PatchGetBufferResults(target, pname, bufsize, length, base::span<T>(params, bufsize));
```

## Note
This error is repeated in other calls to `PatchGetBufferResults` inside `gles2_cmd_decoder_passthrough_doers.cc`.