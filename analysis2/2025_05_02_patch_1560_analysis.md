# Build Failure Analysis: 2025_05_02_patch_1560

## First error

```
../../components/media_router/common/media_source.cc:46:6: error: no viable conversion from 'const std::array<char, 5>' to 'const char *const'
   46 |     {kCastPresentationUrlScheme, kCastDialPresentationUrlScheme,
      |      ^~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used in an initializer list.

## Reason
The rewriter converted `kCastPresentationUrlScheme` to `std::array<char, 5>`, but it is being used in an initializer list that expects `const char* const`. The rewriter should add `.data()` to `kCastPresentationUrlScheme` to convert it to `const char*`.

## Solution
The rewriter should recognize this pattern and add `.data()` to the converted variable.

## Note
The second error is a consequence of the first error. The second error happens because the code is passing a `std::array` to a function that expects a `std::string_view`. The rewriter should add `.data()` to the `std::array` to convert it to a `const char*`, which can then be implicitly converted to a `std::string_view`.