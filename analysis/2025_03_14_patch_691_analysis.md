# Build Failure Analysis: 2025_03_14_patch_691

## First error

../../net/proxy_resolution/proxy_config_service_linux.cc:913:28: error: no viable conversion from 'char *' to 'base::span<char>'

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `strchr` returns a `char*`, but the code attempts to assign this directly to a `base::span<char>`. `base::span` requires a constructor that can accept the pointer and the size. The rewriter should recognize this pattern and either construct a span with a size of 1 or take the length of the buffer that `strchr` operates on. Because `strchr` returns the address of the '=' character, it is difficult to derive the intended size.

## Solution
The rewriter needs to construct a span from the `char*` return value of `strchr` instead of blindly assigning it. Since calculating the size of the span may be impossible in the general case, the best approach is to not spanify the variables that would receive the return value of third-party functions like `strchr`.

## Note
The other errors are a direct consequence of this error, since `split` isn't a `char*` anymore.