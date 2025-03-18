# Build Failure Analysis: 2025_03_14_patch_895

## First error

../../gpu/command_buffer/service/common_decoder_unittest.cc:393:26: error: variable length arrays in C++ are a Clang extension [-Werror,-Wvla-cxx-extension]
  393 |   static const char zero[(kData.size() * sizeof(decltype(kData)::value_type))] =

## Category
Rewriter needs to use `std::size` instead of `.size()` when declaring the size of a `static const char[]` array that relies on a spanified `.size()` method.

## Reason
The rewriter replaced `static const char kData[]` with `static const std::string_view kData`.  Then, the rewriter attempted to compute the size of another array using `kData.size()`. However, it is not allowed to initialize a static const array with a size that is not a constant expression.  Accessing the `.size()` method of a `std::string_view` at compile time in this context is causing this problem, and triggering the `-Wvla-cxx-extension` error since the resulting size is not a constant expression.

## Solution
Use `std::size(kData)` instead of `kData.size()`. It will return a constant expression for the size of the array.

```
- static const char zero[(kData.size() * sizeof(decltype(kData)::value_type))] =
+ static const char zero[(std::size(kData) * sizeof(decltype(kData)::value_type))] =
```

## Note
The code changes also resulted in an invalid operand error which can be resolved by using `.data()` in the call to memcmp. But since it is a secondary error, it is not analyzed.