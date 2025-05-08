# Build Failure Analysis: 2025_05_02_patch_1408

## First error

../../url/url_canon_ip.h:566:10: error: no matching function for call to 'DoIPv4AddressToNumber'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoIPv4AddressToNumber` was spanified. However, the call sites are passing raw pointers. The rewriter needs to update the call sites to pass spans, not raw pointers.

## Solution
The rewriter needs to update the call sites of `DoIPv4AddressToNumber` to pass a span.

For example, this call site:

```c++
  return internal::DoIPv4AddressToNumber<char, unsigned char>(
```

should be updated to:

```c++
  return internal::DoIPv4AddressToNumber<char, unsigned char>(base::span(
```

and then close it with appropriate size.

## Note
```