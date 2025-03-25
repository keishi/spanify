```
# Build Failure Analysis: 2025_03_19_patch_1688

## First error

../../components/dom_distiller/core/url_utils.cc:74:44: error: no matching function for call to 'strlen'
   74 |                          url::Component(0, strlen(kDomDistillerScheme))));

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code attempts to use `strlen` on `kDomDistillerScheme`, which is now an `std::array<char, 17>`. The `strlen` function expects a `const char*` as input, but receives an `std::array<char, 17>`. The rewriter should have automatically added .data() when that variable is passed to strlen.

## Solution
The rewriter should recognize this pattern and add `.data()` to the `std::array` when it is passed to a C-style function like `strlen`.

```diff
--- a/components/dom_distiller/core/url_utils.cc
+++ b/components/dom_distiller/core/url_utils.cc
@@ -71,7 +71,7 @@ bool IsDistilledPage(const GURL& url, url::Component* scheme,
   if (!url.is_valid() || !scheme)
     return false;
 
-  DCHECK(url::IsStandard(kDomDistillerScheme,
+  DCHECK(url::IsStandard(kDomDistillerScheme.data(),
                          url::Component(0, strlen(kDomDistillerScheme))));
 
   if (!url.has_scheme())

```

## Note
The remaining errors are all similar and related to the same issue of missing `.data()` calls when passing `std::array` to functions expecting `const char*`.