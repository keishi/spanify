# Build Failure Analysis: 2025_05_02_patch_1310

## First error

../../chrome/browser/ui/webui/new_tab_page/untrusted_source.cc:146:10: error: no viable conversion from returned value of type 'const std::array<char, 33>' to function return type 'std::string' (aka 'basic_string<char>')
  146 |   return chrome::kChromeUIUntrustedNewTabPageUrl;

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter converted `kChromeUIUntrustedNewTabPageUrl` from `const char[]` to `std::array<char, 33>`.  The function `GetSource` in `untrusted_source.cc` returns a `std::string`. The rewriter failed to append `.data()` to the `std::array` so that it can be converted to `std::string`, causing the compilation error.

## Solution
The rewriter should append `.data()` to the return value in `GetSource` so that the `std::array` can be converted to `std::string`.

```c++
return chrome::kChromeUIUntrustedNewTabPageUrl.data();
```

## Note
The rewriter also changed usages of `kChromeUIUntrustedNewTabPageUrl` to use `.data()`. The rewriter should also ensure to update the return value to use `.data()` as well.