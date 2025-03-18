# Build Failure Analysis: 2025_03_14_patch_18

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The expression `x + rect.width() * y` has type `int`, but `base::span::subspan` requires an argument of type `size_t` (aka `unsigned long` on the build machine). The compiler is unable to find a suitable conversion because `base::strict_cast` is used, which only allows lossless conversions. The rewriter should instead have generated a `static_cast<size_t>` to convert the expression to the correct type.

## Solution
The rewriter needs to insert a `static_cast<size_t>` before the argument to `subspan()`:

```diff
-                                        .subspan(4 * (x + rect.width() * y));
+                                        .subspan(static_cast<size_t>(4 * (x + rect.width() * y)));
```

## Note
The rewriter is using `base::span` instead of `std::span`.