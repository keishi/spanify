# Build Failure Analysis: 2025_03_19_patch_1884

## First error

../../crypto/sha2_unittest.cc:118:3: error: no matching function for call to 'SHA256HashString'
  118 |   crypto::SHA256HashString(input3, output_truncated3,

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted a C-style array `output_truncated3` to `std::array`, but failed to add `.data()` when that variable is passed to a third_party function call `crypto::SHA256HashString`. The compiler error says "no known conversion from 'std::array<uint8_t, 12>' to 'void *' for 2nd argument".

## Solution
When converting a C-style array to std::array, the rewriter should add `.data()` when that variable is passed to a third_party function call. But a bug in the rewriter prevented this from happening.

```
-  crypto::SHA256HashString(input3, output_truncated3,
+  crypto::SHA256HashString(input3, output_truncated3.data(),
                            (output_truncated3.size() *
                             sizeof(decltype(output_truncated3)::value_type)));
```

## Note
The rewriter also failed to get the correct size since it adds a redundant `(output_truncated3.size() * sizeof(decltype(output_truncated3)::value_type))` after the array size has already been calculated. The correct size should simply be `output_truncated3.size()`.
```
-                           output_truncated3, sizeof(output_truncated3));
+  crypto::SHA256HashString(input3, output_truncated3,
+                           (output_truncated3.size() *
+                            sizeof(decltype(output_truncated3)::value_type)));