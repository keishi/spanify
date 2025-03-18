# Build Failure Analysis: 2025_03_16_patch_1955

## First error

../../ui/gfx/half_float_unittest.cc:63:26: error: no matching conversion for functional-style cast from 'HalfFloat *' (aka 'unsigned short *') to 'base::span<HalfFloat, 1>' (aka 'span<unsigned short, 1>')

## Category
Rewriter needs to use make_span() to create span from raw pointer.

## Reason
The rewriter is directly using the `base::span` constructor with a raw pointer, but it should instead be using `base::make_span` to make this more readable and safe, as `make_span` is designed to handle these raw pointer cases.

## Solution
Replace the functional-style cast with a `base::make_span` call.

```c++
-    FloatToHalfFloat(&f, base::span<HalfFloat, 1>(&ret), 1);
+    FloatToHalfFloat(&f, base::make_span(&ret, 1), 1);
```

## Note
Many files failed to build, which indicates that this error might be widespread.