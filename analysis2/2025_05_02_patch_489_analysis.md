# Build Failure Analysis: 2025_05_02_patch_489

## First error

../../content/browser/interest_group/auction_url_loader_factory_proxy_unittest.cc:540:5: error: no matching member function for call to 'TryMakeRequest'
  540 |     TryMakeRequest(kTrustedSignalsUrl, kAcceptJavascript,

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kTrustedSignalsUrl` to `std::string_view`. `TryMakeRequest` expects `const GURL& url`, `const std::string& url`, or `const network::ResourceRequest& request` as the first parameter. Because `std::string_view` is being passed to `TryMakeRequest`, we need to add `.data()` to `kTrustedSignalsUrl` to resolve this issue.

## Solution
The rewriter should add `.data()` to `kTrustedSignalsUrl` to resolve the type mismatch.

## Note
Multiple errors exist that are related to the type mismatch.