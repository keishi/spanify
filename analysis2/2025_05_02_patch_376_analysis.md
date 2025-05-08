# Build Failure Analysis: 2025_05_02_patch_376

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:770:5: error: no matching function for call to 'memcpy'

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The error message indicates that `memcpy` is being called with `num_arr` as the destination, but `memcpy` expects a `void*` as the first argument, and `num_arr` is now a `std::array<char, sizeof(four_byte_num)>`. `std::array` does not implicitly convert to a pointer.

## Solution
The rewriter needs to be able to recognize the pattern where a `std::array` is being used as the destination buffer for `memcpy`, and automatically call `.data()` on the array to get a raw pointer.

```diff
--- a/testing/libfuzzer/proto/skia_image_filter_proto_converter.cc
+++ b/testing/libfuzzer/proto/skia_image_filter_proto_converter.cc
@@ -766,7 +766,7 @@ template <typename T>
 void Converter::WriteNum(const T num) {
   if (sizeof(T) > 4) {
     auto four_byte_num = base::checked_cast<uint32_t>(num);
-    char num_arr[sizeof(four_byte_num)];
+    std::array<char, sizeof(four_byte_num)> num_arr;
     memcpy(num_arr.data(), &four_byte_num, sizeof(four_byte_num));
     for (size_t idx = 0; idx < sizeof(four_byte_num); idx++)
       output_.push_back(num_arr[idx]);

```

## Note
The same error happens multiple times in this file. This means that a single fix to the rewriter can address all the errors at once.