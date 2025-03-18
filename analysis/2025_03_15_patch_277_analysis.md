```
# Build Failure Analysis: 2025_03_15_patch_277

## First error

../../ui/gfx/skbitmap_operations.cc:121:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Pointer passed into spanified function parameter.

## Reason
The code attempts to implicitly convert a `uint32_t*` returned by `alpha.getAddr32(0, y)` to a `base::span<uint32_t>`. However, `alpha.getAddr32` returns a raw pointer, which `base::span` can't directly accept unless the target is a modifiable value. In this case `alpha_row` is being assigned to a raw pointer return value of a third party function `alpha.getAddr32`. Rewriter failed to spanify this callsite.

## Solution
The rewriter needs to detect the raw pointer return value of `alpha.getAddr32(0,y)` and create a span from it instead of failing to spanify the function parameter.

```c++
base::span<uint32_t> alpha_row(alpha.getAddr32(0, y), alpha.width());
```

## Note
The function `SkBitmap::getAddr32` is a third party function. The rewriter should generate code to construct a span from the return value of a third_party function. Also check other usages of `alpha_row` to see if `.data()` or `.size()` need to be added.