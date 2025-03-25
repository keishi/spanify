# Build Failure Analysis: 2025_03_19_patch_460

## First error

../../third_party/blink/renderer/modules/notifications/notification_resources_loader_test.cc:83:9: error: no viable conversion from 'const std::array<char, 17>' to 'const WebString'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code initializes a `KURL` object, which takes a `const WebString&` as input. `WebString` has a constructor that takes `const char (&data)[N]`.

However, the rewriter converted `kResourcesLoaderBaseUrl` from `char[]` to `std::array<char, 17>`. While `std::array` can be implicitly converted to `base::span`, it can not be implicitly converted to WebString. When a `char[]` is converted to `std::array` it often requires `.data()` to be appended to the variable. This is because many functions expect `char*` and not `std::array`.

## Solution
The rewriter should add `.data()` when a `char[]` variable is converted to `std::array` and passed to `WebString`.

For example, the code:

```c++
KURL url(kResourcesLoaderBaseUrl + file_name);
```

should be rewritten to:

```c++
KURL url(kResourcesLoaderBaseUrl.data() + file_name);