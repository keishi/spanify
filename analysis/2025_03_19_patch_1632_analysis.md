```
# Build Failure Analysis: 2025_03_19_patch_1632

## First error

../../ui/gfx/half_float_unittest.cc:63:26: error: no matching conversion for functional-style cast from 'HalfFloat *' (aka 'unsigned short *') to 'base::span<HalfFloat, 1>' (aka 'span<unsigned short, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The rewriter spanified `FloatToHalfFloat`, but failed to update a call site. The code attempts to construct a `base::span<HalfFloat, 1>` directly from a raw pointer `&ret`. The `FloatToHalfFloat` function takes `base::span<HalfFloat> output` which doesn't accept a raw pointer unless there's enough information to construct a span.

## Solution
The rewriter needs to identify when a function is spanified, and then update all call sites to pass in spans instead of raw pointers.

```diff
-   FloatToHalfFloat(&f, base::span<HalfFloat, 1>(&ret), 1);
+   FloatToHalfFloat(&f, base::make_span(&ret, 1), 1);
```

## Note
The rewriter should generally handle calls where the size of the destination is explicit.
The category `Rewriter failing to recognize raw pointer passed to spanified function.` should be reused.