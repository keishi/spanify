# Build Failure Analysis: 2025_05_02_patch_1803

## First error

../../chrome/test/base/chrome_test_suite.cc:92:7: error: no viable conversion from 'const char *const[]' to 'base::span<const char *const>'
   92 |       ChromeMainDelegate::kNonWildcardDomainNonPortSchemes,
      |       ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter is attempting to convert `const char *const[]` to `base::span<const char *const>` for the variable `ChromeMainDelegate::kNonWildcardDomainNonPortSchemes`. However, this code is being used to initialize `g_non_domain_wildcard_non_port_schemes`. This assignment to a static global variable with span is not allowed because `g_non_domain_wildcard_non_port_schemes` needs a static initializer and `base::span` requires dynamic initialization. This is causing a build error because `base::span` is passed to `SetNonWildcardDomainNonPortSchemes`.

## Solution
The rewriter needs to avoid spanifying the global variable initialization. Ideally the rewriter should create a temporary variable to pass to the function, and then use the temporary variable to create a new span.

## Note

The code change modified `ContentSettingsPattern::SetNonWildcardDomainNonPortSchemes` to accept a `base::span` as an argument instead of `const char* const* schemes, size_t count`.