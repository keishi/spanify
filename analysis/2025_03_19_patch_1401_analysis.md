```
# Build Failure Analysis: 2025_03_19_patch_1401

## First error

../../chrome/test/base/chrome_test_suite.cc:92:7: error: no viable conversion from 'const char *const[]' to 'base::span<const char *const>'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter is attempting to convert a C-style array `ChromeMainDelegate::kNonWildcardDomainNonPortSchemes` to a `base::span` type. However the implicit conversion is failing because the constructor of `base::span` can't automatically convert from the array. The error message indicates that none of the `base::span` constructors are viable for implicit conversion from `const char *const[]`.

## Solution
To fix this, the rewriter needs to generate code to explicitly construct a span from the C-style array. It can do this by passing `.data()` and the size of the array to `base::span`. Note that `base::ranges::size()` may not work here because this variable might not satisfy `std::ranges::sized_range` due to how it is initialized.

For example, rewriter should generate:

```c++
base::span<const char* const> g_non_domain_wildcard_non_port_schemes(ChromeMainDelegate::kNonWildcardDomainNonPortSchemes, ChromeMainDelegate::kNonWildcardDomainNonPortSchemesCount);
```

## Note
It is also important to remember that the rewriter only rewrites code inside Chromium and not third party code. So, `base::span` or `std::array` cannot be used if the argument is from third party code.