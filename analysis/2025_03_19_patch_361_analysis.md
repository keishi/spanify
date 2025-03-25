# Build Failure Analysis: 2025_03_19_patch_361

## First error

../../net/dns/dns_transaction_unittest.cc:2618:31: error: no viable conversion from 'const std::string_view' (aka 'const basic_string_view<char>') to 'const char *'

## Category
Rewriter needs to add .data() when converting a string literal to std::string_view in a function call.

## Reason
The rewriter spanified the kMockHostname variable from `const char[]` to `std::string_view`. The surrounding code was concatenating this variable and passing it into a function that expects a `const char*`. The rewriter should have recognized this pattern and added `.data()` to kMockHostname, but failed to do so.

## Solution
The rewriter should recognize this pattern of `std::string_view` passed to a function expecting `const char*` and add `.data()`.

```
-  AddQueryAndErrorResponse(0, kMockHostname, dns_protocol::kTypeA,
+  AddQueryAndErrorResponse(0, kMockHostname.data(), dns_protocol::kTypeA,
```

## Note
None