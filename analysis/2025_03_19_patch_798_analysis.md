# Build Failure Analysis: 2025_03_19_patch_798

## First error

../../net/cookies/cookie_base.cc:559:14: error: no matching function for call to 'StrCat'
  559 |              base::StrCat({url::kHttpsScheme, url::kStandardSchemeSeparator,

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter is adding `.data()` to `url::kStandardSchemeSeparator`, but this variable was not spanified/arrayified. The rewriter shouldn't be touching unrelated code.

## Solution
The rewriter must be fixed to only add `.data()` to variables that it spanified or arrayified.

## Note
The rewriter may also have similar errors in the other code that it touched.