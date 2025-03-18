# Build Failure Analysis: 2025_03_14_patch_731

## First error

../../chrome/browser/apps/icon_standardizer.cc:114:31: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<const SkColor>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The error occurs because the code attempts to directly assign a raw pointer (`SkColor*`) returned by a third-party function (`bitmap.getAddr32(0, y)`) to a `base::span`.  `base::span` does not have an implicit conversion from a raw pointer; it requires a size to be explicitly specified to define the extent of the span.  The rewriter did not generate the necessary code to construct a `base::span` object from the raw pointer, thus causing a compilation error.

## Solution
The rewriter needs to generate code that explicitly constructs a `base::span` from the pointer returned by `bitmap.getAddr32(0, y)`. Since the rewriter can't easily determine the size, add a comment suggesting what size to pass.

For example, the generated code should look like this:

```c++
base::span<const SkColor> src_color = base::span<const SkColor>(
    reinterpret_cast<SkColor*>(bitmap.getAddr32(0, y)),
    width /* Replace with actual size */);
```

## Note
The fix also apply to https://source.chromium.org/chromium/chromium/src/+/92fa51da0b065871ab54d1337a4d4f09e21ed717:chrome/browser/apps/icon_standardizer.cc;l=116.