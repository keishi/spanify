# Build Failure Analysis: 2025_03_19_patch_1553

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The rewriter is passing a signed integer to `subspan()`, which requires an unsigned value. The error occurs because the `strict_cast` within the `StrictNumeric` constructor fails since it cannot safely convert a signed integer to an unsigned integer without a potential loss of information (negative values).

## Solution
When passing a signed integer as an argument to `subspan()`, cast it to `size_t` (or some other appropriate unsigned type) to ensure that the value is within the valid range for the function.

For example, change this line:

```c++
base::span<const GLuint>(tx_ids).subspan(1).data()
```

to:

```c++
base::span<const GLuint>(tx_ids).subspan(static_cast<size_t>(1)).data()
```

## Note
N/A