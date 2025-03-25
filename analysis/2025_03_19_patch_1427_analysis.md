# Build Failure Analysis: 2025_03_19_patch_1427

## First error

../../third_party/abseil-cpp/absl/strings/internal/str_format/arg.h:431:31: error: no matching function for call to 'FormatConvertImpl'

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The test is failing because after converting `char src[kSrcLen]` to `std::array<char, kSrcLen> src`, the `StringPrintf` function is called with `src` as an argument, but `StringPrintf` expects a `const char*`. The rewriter should have added `.data()` to `src` to convert it to a `const char*`.

## Solution
Add `.data()` when passing arrayified `char[]` variable to `StringPrintf`.

```diff
--- a/base/strings/stringprintf_unittest.cc
+++ b/base/strings/stringprintf_unittest.cc
@@ -76,7 +76,7 @@
   for (int i = 1; i < 3; i++) {
     src[kSrcLen - i] = 0;
     std::string out;
-    EXPECT_EQ(src, StringPrintf("%s", src));
+    EXPECT_EQ(src.data(), StringPrintf("%s", src.data()));
   }
 }

```

## Note
The second error is related to `no matching function for call to 'StringPrintf'` which is a consequence of the first error.