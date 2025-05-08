# Build Failure Analysis: 2025_05_02_patch_1410

## First error

../../url/url_canon_ip.h:481:8: error: no matching function for call to 'DoParseIPv6'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoParseIPv6` was spanified to take a `base::span<const CHAR>`, but the call site in `DoIPv6AddressToNumber` is still passing a raw pointer `const CHAR* spec`. The rewriter failed to update the call site to pass a span.

## Solution
The rewriter needs to identify call sites of spanified functions and update them to pass a span instead of a raw pointer. In this case, the call site `DoParseIPv6(spec, ipv6_comp, &ipv6_parsed)` needs to be updated to `DoParseIPv6(base::span(spec, host.len), ipv6_comp, &ipv6_parsed)` or similar, making sure to use the correct size for the span.