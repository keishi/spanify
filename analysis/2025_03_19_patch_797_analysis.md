# Build Failure Analysis: 2025_03_19_patch_797

## First error

../../url/url_util.cc:82:45: error: no matching constructor for initialization of 'std::vector<std::string>' (aka 'vector<basic_string<char>>')
   82 |   std::vector<std::string> secure_schemes = {
      |                                             ^
   83 |       kHttpsScheme,

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter added `.data()` to `url::kDataScheme` in multiple places. However, `url::kDataScheme` is now of type `std::array<char, 5>`. The constructor for `std::vector` taking a braced-init-list of `const char*` is now ambiguous with other constructors after `url::kDataScheme` became an array. The array can decay into a pointer with `.data()`, making the braced-init-list constructor viable again.

## Solution
The rewriter added `.data()` to `url::kDataScheme` in multiple places, which is incorrect and broke the compilation. The rewriter should not be adding `.data()` to variables it did not spanify/arrayify.

## Note
The patch adds `.data()` to these global `url::k*Scheme` constants.

```
chrome/browser/chrome_navigation_browsertest.cc
components/page_load_metrics/browser/metrics_web_contents_observer.cc
components/safe_browsing/core/common/scheme_logger.cc
content/browser/child_process_security_policy_impl.cc
content/browser/loader/navigation_url_loader_impl.cc
content/browser/renderer_host/blocked_scheme_navigation_browsertest.cc
url/url_constants.h
url/url_util.cc