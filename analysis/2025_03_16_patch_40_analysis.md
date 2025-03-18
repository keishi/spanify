# Build Failure Analysis: 2025_03_16_patch_40

## First error

../../media/base/audio_bus_unittest.cc:646:56: error: invalid operands to binary expression ('const std::array<float, kTestVectorSize>' and 'size_t' (aka 'unsigned long'))
  646 |     ASSERT_EQ(0, memcmp(test_array, kTestVectorFloat32 +

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in memcmp.

## Reason
The rewriter changed `kTestVectorFloat32` to `std::array<float, kTestVectorSize>`. However, it failed to update the call site of `memcmp` which expects a pointer as an argument and not `std::array`. The rewriter should have added `.data()` to the array variable. The expression `kTestVectorFloat32 + kPartialStart * kTestVectorChannelCount` is also invalid since `kTestVectorFloat32` is now a `std::array` and not a raw pointer, so pointer arithmetic is no longer allowed.

## Solution
The rewriter should add `.data()` to the array variable when it is passed to `memcmp`. In this particular case, it could change `kTestVectorFloat32 + kPartialStart * kTestVectorChannelCount` to `kTestVectorFloat32.data() + kPartialStart * kTestVectorChannelCount`
or `&kTestVectorFloat32[kPartialStart * kTestVectorChannelCount]`

## Note
There is also another error on line 648 which is also caused by the same reason.