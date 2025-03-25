# Build Failure Analysis: 2025_03_19_patch_1044

## First error

../../ui/gfx/skbitmap_operations.cc:120:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
  120 |     base::span<uint32_t> rgb_row = rgb.getAddr32(0, y);
      |                          ^         ~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign the return value of `rgb.getAddr32(0, y)` (which is a `uint32_t*`) directly to a `base::span<uint32_t>`. The rewriter isn't generating the necessary code to construct a `base::span` from the raw pointer. `rgb.getAddr32` is a third_party function that returns a raw pointer.

## Solution
The rewriter needs to generate code to explicitly construct a `base::span` from the pointer returned by `rgb.getAddr32(0, y)`. The corrected line should look like this:

```c++
base::span<uint32_t> rgb_row(rgb.getAddr32(0, y), rgb.width());
```
Unfortunately the number of elements `rgb.width()` cannot be reliably determined. It has to be provided manually:
```c++
base::span<uint32_t> rgb_row(rgb.getAddr32(0, y), <# number of elements #>);
```

## Note
This issue also occurs for `alpha_row` and `dst_row`. All three need to be fixed in the same way. Also note that `rgb.getAddr32` is third_party code, so it can never be spanified. This means we will always need to generate code to construct a span from its return value.