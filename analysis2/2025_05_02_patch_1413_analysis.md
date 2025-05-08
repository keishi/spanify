# Build Failure Analysis: 2025_05_02_patch_1413

## First error

../../url/url_canon_ip.h:588:10: error: no matching function for call to 'DoIPv6AddressToNumber'
  588 |   return internal::DoIPv6AddressToNumber<char, unsigned char>(spec, host,
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_ip.h:466:16: note: candidate function template not viable: no known conversion from 'const char *' to 'base::span<const char>' for 1st argument
  466 | constexpr bool DoIPv6AddressToNumber(base::span<const CHAR> spec,
      |                ^                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoIPv6AddressToNumber` was spanified, but the call sites were not updated to pass a `base::span`. The error message indicates that the code is trying to pass `const char *` to a function that expects `base::span<const char>`.

## Solution
The rewriter needs to identify all call sites of spanified functions and update them to pass `base::span` objects. In this case, the `spec` argument needs to be converted to a `base::span`.
```
# before
DoIPv6AddressToNumber<char, unsigned char>(spec, host, address);

# after
DoIPv6AddressToNumber<char, unsigned char>(base::span(spec, strlen(spec)), host, address);
```

## Note
The other alternative is to not spanify this function at all.