# Build Failure Analysis: 2025_05_02_patch_1575

## First error

```
../../net/ntlm/ntlm_unittest.cc:393:63: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 90UL>' (aka 'const array<unsigned char, 90UL>') and 'const size_t' (aka 'const unsigned long'))
  393 |   ASSERT_EQ(0, memcmp(test::kExpectedTargetInfoSpecResponseV2 +
      |                       ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^
  394 |                           kMissingServerPairsLength,
      |                           ~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to avoid using binary operator on arrayified variable.

## Reason
The code attempts to perform pointer arithmetic on `kExpectedTargetInfoSpecResponseV2`, which has been converted to `std::array`.  `std::array` does not support the `+` operator in the same way that C-style arrays do for pointer arithmetic. The error message "invalid operands to binary expression" confirms this. The code is trying to offset the pointer by adding `kMissingServerPairsLength` which is of type size_t.

## Solution
The rewriter should use .data() to get a pointer to the underlying array to do arithmetic, or use subspan.

```c++
ASSERT_EQ(0, memcmp(test::kExpectedTargetInfoSpecResponseV2.data() +
                          kMissingServerPairsLength,
                      updated_target_info.data(), updated_target_info.size()));
```

or

```c++
ASSERT_EQ(0, memcmp(test::kExpectedTargetInfoSpecResponseV2.subspan(kMissingServerPairsLength).data(),
                      updated_target_info.data(), updated_target_info.size()));
```
## Note
The fix from line 316 is correct. `kExpectedTargetInfoSpecResponseV2.data()`