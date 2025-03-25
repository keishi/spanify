# Build Failure Analysis: 2025_03_19_patch_1317

## First error

../../ui/gfx/shadow_value_unittest.cc:28:31: error: no matching function for call to 'to_array'

## Category
Rewriter needs to add `.data()` to arrayified `char[]` variable used with std::string.

## Reason
The code uses `std::to_array` which returns a `std::array`. The rewriter changes `ShadowValue shadows[2]` to `std::array<ShadowValue, 2> shadows;`. However the generated code doesn't add `.data()` to the `std::array` when it's being passed into a third party function (`ShadowValues`'s constructor).

```c++
 ShadowValues(kTestCases[i].shadows.data(),
                     base::span<ShadowValue>(kTestCases[i].shadows)
                         .subspan(kTestCases[i].shadow_count)
                         .data()));
```

The first argument to `ShadowValues` should have `.data()` appended to it.

## Solution
The rewriter should add `.data()` to arrayified `char[]` variable used with std::string.

## Note
Secondary error is missing a namespace for `std::span`.