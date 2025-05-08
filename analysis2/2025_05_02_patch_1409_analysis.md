# Build Failure Analysis: 2025_05_02_patch_1409

## First error

../../url/url_canon_ip.h:527:9: error: no matching function for call to 'IPv4AddressToNumber'
  527 |         IPv4AddressToNumber(spec, ipv6_parsed.ipv4_component,

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `IPv4AddressToNumber` function, but failed to spanify a call site in `DoIPv6AddressToNumber`. The function now expects a `base::span<unsigned char, 4>` as its third argument, but the code in `DoIPv6AddressToNumber` is passing a raw `unsigned char address[4]`.

## Solution
The rewriter should also update the call sites of `IPv4AddressToNumber` within `DoIPv6AddressToNumber` to pass a `base::span` constructed from the `address` array. This could be done by wrapping the array with `base::span(address)`.

```c++
return internal::DoIPv6AddressToNumber<char, unsigned char>(spec, host,
      base::span(address), num_ipv4_components);
```
or

```c++
base::span<unsigned char, 4> address_span(address);
return internal::DoIPv6AddressToNumber<char, unsigned char>(spec, host,
      address_span, num_ipv4_components);
```

## Note
The same error occurs for both `char` and `char16_t` specializations of the `DoIPv6AddressToNumber` template. The error also occurs in `net/base/ip_address.h`.
```
../../net/base/ip_address.h:155:39: error: no matching function for call to 'IPv4AddressToNumber'
  155 |   url::CanonHostInfo::Family family = url::IPv4AddressToNumber(
      |                                       ^~~~~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_ip.h:562:33: note: candidate function not viable: no known conversion from 'IPAddressBytes' to 'base::span<unsigned char, 4>' for 3rd argument
  562 | constexpr CanonHostInfo::Family IPv4AddressToNumber(
      |                                 ^
  563 |     const char* spec,
  564 |     const Component& host,
  565 |     base::span<unsigned char, 4> address,
      |     ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```
The patch for net/base/ip_address.h should be as follows:
```diff
--- a/net/base/ip_address.h
+++ b/net/base/ip_address.h
@@ -153,7 +153,7 @@
 constexpr bool ParseIPLiteralToBytes(std::string_view ip_literal,
   url::Component host_comp(0, static_cast<int>(ip_literal.size()));
   int num_components;
-  url::CanonHostInfo::Family family = url::IPv4AddressToNumber(
+  url::CanonHostInfo::Family family = url::IPv4AddressToNumber(  
       ip_literal.data(), host_comp, bytes->data(), &num_components);
   return family == url::CanonHostInfo::IPV4;
 }

```

should be changed to

```diff
--- a/net/base/ip_address.h
+++ b/net/base/ip_address.h
@@ -153,7 +153,7 @@
 constexpr bool ParseIPLiteralToBytes(std::string_view ip_literal,
   url::Component host_comp(0, static_cast<int>(ip_literal.size()));
   int num_components;
-  url::CanonHostInfo::Family family = url::IPv4AddressToNumber(
+  url::CanonHostInfo::Family family = url::IPv4AddressToNumber(  
       ip_literal.data(), host_comp, base::span(*bytes), &num_components);
   return family == url::CanonHostInfo::IPV4;
 }