# Build Failure Analysis: 2025_03_19_patch_1428

## First error

../../base/strings/stringprintf_unittest.cc:127:25: error: no matching function for call to 'StringPrintf'
  127 |   EXPECT_EQ(src.data(), StringPrintf("%s", src));

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The rewriter converted `char src[kBufLen]` to `std::array<char, kBufLen> src`. When passing `src` to `StringPrintf("%s", src)`, it needs to be `StringPrintf("%s", src.data())` because `StringPrintf` expects a `char*`, not a `std::array<char, kBufLen>`.

## Solution
The rewriter should recognize this pattern and add `.data()`.
For example, the rewriter should transform

```c++
EXPECT_EQ(src.data(), StringPrintf("%s", src));
```

to

```c++
EXPECT_EQ(src.data(), StringPrintf("%s", src.data()));