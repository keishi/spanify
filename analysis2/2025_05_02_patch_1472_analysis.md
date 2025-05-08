# Build Failure Analysis: 2025_05_02_patch_1472

## First error

../../third_party/blink/renderer/modules/notifications/notification_resources_loader_test.cc:83:9: error: no viable conversion from 'const std::array<char, 17>' to 'const WebString'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `kResourcesLoaderBaseUrl` from `char[]` to `std::array<char, 17>`. In the `InitResourcesLoader`, this variable is passed to a function expecting a `WebString`. `WebString` can be constructed using `char*`.  Since the variable has been arrayified, it now needs a `.data()` call to convert it to a `char*`.

## Solution
The rewriter needs to add `.data()` to `kResourcesLoaderBaseUrl` when passed to `InitResourcesLoader`. The rewriter should generate `WTF::String(kResourcesLoaderBaseUrl.data())` instead of `WTF::String(kResourcesLoaderBaseUrl)`.

## Note
The rewriter also failed to add `.data()` to the use of `kResourcesLoaderBaseUrl` on line 91.