# Build Failure Analysis: 2025_05_02_patch_199

## First error

../../mojo/public/c/system/tests/core_api_unittest.cc:115:38: error: no viable conversion from 'MojoHandleSignals *' (aka 'unsigned int *') to 'base::span<const MojoHandleSignals>' (aka 'span<const unsigned int>')
  115 |             mojo::WaitMany(&handle0, &sig, 1, &result_index, states));
      |                                      ^~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `mojo::WaitMany` was spanified, but the call site in `core_api_unittest.cc` is passing a raw pointer `&sig` where a `base::span` is expected. This is because the rewriter did not spanify the call site.

## Solution
The rewriter needs to spanify the call site to `mojo::WaitMany` in `core_api_unittest.cc` to pass a `base::span` instead of a raw pointer. The `sig` variable is a local variable so it needs to be wrapped with `base::span(&sig, 1)`.

## Note
There is a similar error in line 207 in the same file.