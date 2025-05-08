# Build Failure Analysis: 2025_05_02_patch_1406

## First error

../../url/url_canon_ip.h:181:36: error: no matching function for call to 'IPv4ComponentToNumber'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `IPv4ComponentToNumber` was spanified, but the call sites were not updated to pass a `base::span`.  Specifically, the arguments passed to `IPv4ComponentToNumber` at url/url_canon_ip.h:181 are raw `char*` or `char16_t*` pointers, not `base::span`.

## Solution
The rewriter needs to update the call sites of spanified functions to pass `base::span` objects instead of raw pointers. This likely involves creating a `base::span` from the existing pointer and size information (component.len in this case).

The call should be converted from:
```c++
IPv4ComponentToNumber(spec, component, number)
```
to
```c++
IPv4ComponentToNumber(base::span<const CHAR>(spec, component.len), component, number)
```

## Note
The error occurs in the header file url/url_canon_ip.h so it is not third party code. There are 2 instances of the error.
```
../../url/url_canon_ip.h:181:36: error: no matching function for call to 'IPv4ComponentToNumber'
  181 |     CanonHostInfo::Family family = IPv4ComponentToNumber(
      |                                    ^~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_ip.h:566:20: note: in instantiation of function template specialization 'url::internal::DoIPv4AddressToNumber<char, unsigned char>' requested here
  566 |   return internal::DoIPv4AddressToNumber<char, unsigned char>(
      |                    ^
../../url/url_canon_ip.h:54:33: note: candidate template ignored: could not match 'base::span<const CHAR>' against 'const char *'
   54 | constexpr CanonHostInfo::Family IPv4ComponentToNumber(
      |                                 ^
../../url/url_canon_ip.h:181:36: error: no matching function for call to 'IPv4ComponentToNumber'
  181 |     CanonHostInfo::Family family = IPv4ComponentToNumber(
      |                                    ^~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_ip.h:575:20: note: in instantiation of function template specialization 'url::internal::DoIPv4AddressToNumber<char16_t, char16_t>' requested here
  575 |   return internal::DoIPv4AddressToNumber<char16_t, char16_t>(
      |                    ^
../../url/url_canon_ip.h:54:33: note: candidate template ignored: could not match 'base::span<const CHAR>' against 'const char16_t *'
   54 | constexpr CanonHostInfo::Family IPv4ComponentToNumber(
      |                                 ^