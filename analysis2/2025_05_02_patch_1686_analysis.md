# Build Failure Analysis: 2025_05_02_patch_1686

## First error

../../url/url_canon_ip.cc:181:7: error: no matching function for call to 'DoCanonicalizeIPv6Address'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function `DoCanonicalizeIPv6Address`, but failed to spanify the callsite. The error message indicates that no matching function can be found, implying that the arguments provided to `DoCanonicalizeIPv6Address` at the call site are incompatible with the spanified version of the function. Specifically, the call sites are passing `const char*` and `const char16_t*` where `base::span<const CHAR>` is now expected.

## Solution
The rewriter needs to also spanify the call site to pass a span constructed from the `const char*` or `const char16_t*` parameters. This can be done by wrapping the arguments with `base::span<>`.
For example:
```c++
DoCanonicalizeIPv6Address<char, unsigned char>(base::span<const char>(spec, host.len), host, output, host_info);
```

## Note
There are multiple call sites that need spanifying, as indicated by the multiple errors in the build log.