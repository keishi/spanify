# Build Failure Analysis: 2025_03_14_patch_1006

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The `strict_cast` function is failing because the argument passed to `subspan()` is not of the expected type. The `strict_cast` is used within the StrictNumeric constructor. The issue occurs because `std::to_array` returns a signed `int` and the `subspan()` function expects an unsigned value.

## Solution
Cast the result of the `std::to_array`'s subspan to an `unsigned long` before calling `.data()`. This can be done using `static_cast<unsigned long>`.

```c++
       std::string(
           binary_data.data(),
           base::span<const unsigned char>(binary_data).subspan(static_cast<unsigned long>(0)).data()),
       std::string(
           binary_data.data(),
           base::span<const unsigned char>(binary_data).subspan(static_cast<unsigned long>(1)).data()),
       std::string(
           binary_data.data(),
           base::span<const unsigned char>(binary_data).subspan(static_cast<unsigned long>(4)).data())};