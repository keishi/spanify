# Build Failure Analysis: 2025_03_19_patch_1881

## First error

../../crypto/sha2_unittest.cc:94:3: error: no matching function for call to 'SHA256HashString'

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter failed to add `.data()` when converting a C-style array to `std::array`. The `SHA256HashString` function expects a `void*` as the second argument. The rewritten code passes `output_truncated2`, which is a `std::array<uint8_t, 6>`, without calling `.data()` on it.

## Solution
The rewriter should add `.data()` to the `std::array` argument when calling `SHA256HashString`. The corrected function call should look like this:
`crypto::SHA256HashString(input2, output_truncated2.data(), (output_truncated2.size() * sizeof(decltype(output_truncated2)::value_type)));`

## Note
There are two other instances where the size is being calculated for the `for` loop.

```
  for (size_t i = 0; i < crypto::kSHA256Length; i++)
    EXPECT_EQ(expected2[i], static_cast<int>(output2[i]));

  for (size_t i = 0; i < sizeof(output_truncated2); i++)
    EXPECT_EQ(expected2[i], static_cast<int>(output_truncated2[i]));
```

The rewriter correctly replaced sizeof with `(output_truncated2.size() * sizeof(decltype(output_truncated2)::value_type))`.