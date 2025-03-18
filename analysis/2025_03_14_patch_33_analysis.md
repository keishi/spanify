# Build Failure Analysis: 2025_03_14_patch_33

## First error

../../ui/gfx/skbitmap_operations.cc:597:33: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<const SkPMColor>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the raw pointer returned by `bitmap.getAddr32` to a `base::span`. The `base::span` expects a `base::span` or something that can be converted to a span, but `bitmap.getAddr32` returns a raw pointer. The rewriter must generate the code to construct the `base::span` from this raw pointer. The size is not known so we can't generate the correct span.

## Solution
Rewriter needs to generate proper span construction logic, but the size is not possible to identify.

## Note
The other two errors are follow-on errors from the first error.
```
../../ui/gfx/skbitmap_operations.cc:600:16: error: no viable overloaded '='
  600 |       cur_src1 = bitmap.getAddr32(0, src_y + 1);
      |       ~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~
```