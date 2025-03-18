# Build Failure Analysis: 2025_03_14_patch_172

## First error

../../base/files/file_unittest.cc:634:47: error: invalid operands to binary expression ('std::array<char, kDataSize>' and 'const int')
  634 |   EXPECT_EQ(std::string(buffer.data(), buffer + kDataSize), data);
      |                                        ~~~~~~ ^ ~~~~~~~~~

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted a `char[]` to `std::array`, but it is being used as an iterator. When using a std::array, the .data() method must be called to get a pointer.

## Solution
The rewriter should recognize this pattern and add .data().

## Note
The other error is
```
../../base/files/file_unittest.cc:659:47: error: invalid operands to binary expression ('std::array<char, kDataSize>' and 'const int')
  659 |   EXPECT_EQ(std::string(buffer.data(), buffer + kDataSize), data);
      |                                        ~~~~~~ ^ ~~~~~~~~~