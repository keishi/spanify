# Build Failure Analysis: 2025_03_14_patch_1877

## First error

../../media/parsers/h264_parser.cc:584:5: error: no matching function for call to 'memcpy'
  584 |     memcpy(scaling_list4x4[i], kDefault4x4Intra, sizeof(kDefault4x4Intra));
      |     ^~~~~~

## Category
Rewriter needs to handle conversion from std::array to pointer when calling memcpy.

## Reason
The code uses `memcpy` with `scaling_list4x4[i]` as the destination, which after the rewriter change is now a `std::array<uint8_t, 16>`. `memcpy` expects a `void*` as the destination, but `scaling_list4x4[i]` is an object of type `std::array<uint8_t, 16>`, not a pointer. Also, in the `FillDefaultSeqScalingLists` function, the rewriter incorrectly assumes `scaling_list4x4` is declared and so inserts `.data()` calls.

## Solution
The rewriter should use the `.data()` method to get a pointer to the underlying data of the `std::array` when calling `memcpy`. In `FillDefaultSeqScalingLists` the rewriter shouldn't assume `scaling_list4x4` exists.
```c++
memcpy(sps->scaling_list4x4[i].data(), kDefault4x4Intra, sizeof(kDefault4x4Intra));
```
In this case a ranged for loop would be the idiomatic way to express this:
```c++
for (auto & scaling_list : sps.scaling_list4x4) {
  memcpy(scaling_list.data(), kDefault4x4Intra, sizeof(kDefault4x4Intra));
}
```

## Note
Multiple `memcpy` calls are affected. The error message "use of undeclared identifier 'scaling_list4x4'" indicates that the rewriter made an incorrect replacement in FillDefaultSeqScalingLists function as well. Also passing `scaling_list4x4[0]` and `scaling_list4x4[1]` as `const uint8_t*` is incorrect, which are again side effects of changing `scaling_list4x4` to `std::array`.
```c++
../../media/parsers/h264_parser.cc:782:9: error: no matching function for call to 'FallbackScalingList4x4'
  782 |         FallbackScalingList4x4(i, sps.scaling_list4x4[0],

```