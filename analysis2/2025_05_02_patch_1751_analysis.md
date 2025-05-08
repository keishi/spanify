# Build Failure Analysis: 2025_05_02_patch_1751

## First error
../../net/proxy_resolution/proxy_config_service_linux.cc:914:28: error: no viable conversion from 'char *' to 'base::span<char>'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter converted `char* split` to `base::span<char> split`, but `strchr` returns a `char*`. There is no implicit conversion from a `char*` to a `base::span<char>`. `strchr` is a system library function that is safe to call.

## Solution
The rewriter should detect that `strchr` is being assigned to a `base::span<char>` and create a span from the `char*` using the correct size. In this case, it should use `base::make_span` on the returned `char*` to create the span. In the case of `strchr` the size information is unavailable. Therefore the rewriter should give up.

## Note
The second error is related to incrementing the `base::span<char> split` as well as converting the span to a string.