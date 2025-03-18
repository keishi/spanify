# Build Failure Analysis: 2025_03_14_patch_323

## First error

../../chrome/test/base/chrome_test_suite.cc:92:7: error: no viable conversion from 'const char *const[]' to 'base::span<const char *const>'

## Category
Rewriter needs to handle conversion from C-style array to span.

## Reason
The code attempts to initialize a `base::span<const char* const>` with a C-style array `const char *const[]`. The compiler cannot implicitly convert a C-style array to a `base::span`. There are two issues: The existing code `g_non_domain_wildcard_non_port_schemes` was a C-style array.

## Solution
The rewriter needs to create a `base::span` from the `g_non_domain_wildcard_non_port_schemes` C-style array, so the code becomes `base::span(g_non_domain_wildcard_non_port_schemes, g_non_domain_wildcard_non_port_schemes_count)`.

## Note
This overlaps with Rewriter needs to handle conversion from C-style array to span.