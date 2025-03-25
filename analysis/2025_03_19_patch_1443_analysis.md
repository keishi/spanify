# Build Failure Analysis: 2025_03_19_patch_1443

## First error

../../components/viz/test/gl_scaler_test_util.cc:375:38: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<const uint32_t>' (aka 'const span<const unsigned int>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter is failing to recognize a raw pointer being passed to a spanified variable. `plane.getAddr32` returns a raw pointer. The rewriter should recognize that this is a size info unavailable rhs value.

## Solution
The rewriter needs to be updated to handle size info unavailable rhs values. In this particular case, `plane.getAddr32` is returning a raw pointer. Because the rewriter successfully detected this function return type as `uint32_t*`, it should be able to construct a `span<const uint32_t>`. Because `SkBitmap::getAddr32()` comes from third_party code, the spanified version must not pass by value, or pass by raw pointer, or the build will break because of include conflicts.

## Note
The function SkBitmap::getAddr32() is third party code.