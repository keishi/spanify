# Build Failure Analysis: 2025_05_02_patch_42

## First error

../../content/common/url_schemes.cc:32:3: error: no viable conversion from 'const std::array<char, 7>' to 'const char *const'
   32 |   kChromeUIScheme,
      |   ^~~~~~~~~~~~~~~

## Category
Rewriter needs to be updated to handle std::array when registering content schemes.

## Reason
The content::kChromeUIScheme is now a `std::array<char, 7>`, and the code expects a `const char*`. The error occurs because the code attempts to use the `std::array` directly where a C-style string is expected. This worked previously when `kChromeUIScheme` was a `char*`.

## Solution
The rewriter should add `.data()` to `kChromeUIScheme` to convert it to a `const char*` when used in function calls like `url::AddStandardScheme` and when assigning it to a `const char*` variable.
For example, the line:
```c++
url::AddStandardScheme(kChromeUIScheme, url::SCHEME_WITH_HOST);
```
should be rewritten to:
```c++
url::AddStandardScheme(kChromeUIScheme.data(), url::SCHEME_WITH_HOST);
```

## Note
The error occurs in content/common/url_schemes.cc. Also, there are other similar errors, such as in the line assigning it to a variable.
```c++
 std::string chrome =
      std::string(content::kChromeUIScheme.data()) + "://flags";
```