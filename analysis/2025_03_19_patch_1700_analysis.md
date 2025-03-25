# Build Failure Analysis: 2025_03_19_patch_1700

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:776:3: error: no matching function for call to 'memcpy'
  776 |   memcpy(num_arr, &num, sizeof(T));
      |   ^~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The code uses `memcpy` to copy the value of `num` into the `num_arr` buffer. After the rewriter changed `num_arr` from a C-style array to `std::array`, the `memcpy` call became invalid because `memcpy` expects a pointer to the destination buffer, but `num_arr` is now an `std::array` object, not a pointer. The rewriter should have added `.data()` to `num_arr` to obtain a pointer to the underlying buffer of the `std::array`. Because `memcpy` is a C function, it should be treated as a third party function call.

## Solution
The rewriter needs to add `.data()` to the first argument of the `memcpy` function call after converting the C-style array to `std::array`.
The rewriter needs to add `.data()` when that variable is passed to a third_party function call.

Here's the diff:
```diff
--- a/testing/libfuzzer/proto/skia_image_filter_proto_converter.cc
+++ b/testing/libfuzzer/proto/skia_image_filter_proto_converter.cc
@@ -773,7 +773,7 @@ void Converter::WriteNum(const T num) {
       output_.push_back(num_arr[idx]);
     return;
   }
-  char num_arr[sizeof(T)];
+  std::array<char, sizeof(T)> num_arr;
   memcpy(num_arr.data(), &num, sizeof(T));
   for (size_t idx = 0; idx < sizeof(T); idx++)
     output_.push_back(num_arr[idx]);
```

## Note
There are 11 instances of this issue.