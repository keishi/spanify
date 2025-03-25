# Build Failure Analysis: 2025_03_19_patch_1339

## First error

../../content/common/url_schemes.cc:32:3: error: no viable conversion from 'const std::array<char, 7>' to 'const char *const'

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter has spanified `kChromeUIScheme` from `const char*` to `std::array<char, 7>`, but is not adding .data() in the call sites where this variable is used. The first error `no viable conversion from 'const std::array<char, 7>' to 'const char *const'` is caused by `chrome_schemes_to_whitelist.insert(content::kChromeUIScheme)` which requires a `const char*` but receives a `std::array<char, 7>`.

## Solution
The rewriter should add `.data()` to `content::kChromeUIScheme` for the call sites that requires `const char*`. The corrected code should be `chrome_schemes_to_whitelist.insert(content::kChromeUIScheme.data())`.

## Note
The build failure log indicates 4 errors, all caused by the same root cause.