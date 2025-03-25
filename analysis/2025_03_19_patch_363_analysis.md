# Build Failure Analysis: 2025_03_19_patch_363

## First error

../../gpu/command_buffer/service/common_decoder_unittest.cc:393:26: error: variable length arrays in C++ are a Clang extension [-Werror,-Wvla-cxx-extension]
  393 |   static const char zero[(kData.size() * sizeof(decltype(kData)::value_type))] =

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter spanified the code, but failed to prevent variable length arrays. This is because the variable length array is being used to define a zero initialized array. Since this is generated code, it is excluded from the rewriter. Thus we shouldn't spanify functions that require rewriting excluded code.
```
  static const std::string_view kData = "1234567890123456789";
  static const char zero[(kData.size() * sizeof(decltype(kData)::value_type))] =
      {
          0,
      };
```
## Solution
The rewriter should not spanify the code.

## Note
The second error is this:
```
../../gpu/command_buffer/service/common_decoder_unittest.cc:430:37: error: invalid operands to binary expression ('const std::string_view' (aka 'const basic_string_view<char>') and 'const uint32_t' (aka 'const unsigned int'))
  430 |   EXPECT_EQ(0, memcmp(memory, kData + kSomeOffsetInBucket, kLengthOfPiece));
```
This is happening because `kData` was changed to a string view. This is similar to `Rewriter needs to add .data() to arrayified char[] variable used with std::string.`. But in this case it would require rewriting the code in `static const char zero[]`.