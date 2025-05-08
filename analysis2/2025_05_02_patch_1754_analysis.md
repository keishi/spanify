# Build Failure Analysis: 2025_05_02_patch_1754

## First error

../../gpu/command_buffer/service/common_decoder_unittest.cc:393:26: error: variable length arrays in C++ are a Clang extension [-Werror,-Wvla-cxx-extension]
  393 |   static const char zero[(kData.size() * sizeof(decltype(kData)::value_type))] =

## Category
Rewriter added .data() to a variable/member it did not spanify/arrayify.

## Reason
The rewriter changed `kData` to `std::string_view`, which caused the code to break when declaring `zero` because variable-length arrays are not allowed in C++. `std::string_view::size()` is not a constant expression, which is required to declare the size of a static array.

## Solution
The rewriter should not have changed `kData` to `std::string_view`. It should've left it as `static const char kData[]`.

## Note
The code was changed from a `char[]` to a `std::string_view`.