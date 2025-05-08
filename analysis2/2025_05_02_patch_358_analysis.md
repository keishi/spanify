# Build Failure Analysis: 2025_05_02_patch_358

## First error

```
../../ui/gfx/color_space.cc:220:9: error: no matching function for call to 'FloatsEqualWithinTolerance'
  220 |     if (FloatsEqualWithinTolerance(&to_XYZD50.vals[0][0], &matrix.vals[0][0], 9,
      |         ^~~~~~~~~~~~~~~~~~~~~~~~~~
../../ui/gfx/color_space.cc:40:13: note: candidate function not viable: no known conversion from 'float *' to 'base::span<const float>' for 2nd argument
   40 | static bool FloatsEqualWithinTolerance(const float* a,
      |             ^
   41 |                                        base::span<const float> b,
      |                                        ~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `FloatsEqualWithinTolerance` was spanified. However, the call site passes a raw pointer `&matrix.vals[0][0]` to the spanified parameter `b`. The compiler cannot implicitly convert a raw pointer to a `base::span`. The rewriter spanified a function, but failed to spanify a call site.

## Solution
The rewriter needs to identify this pattern and rewrite the call site to create a `base::span` from the raw pointer, using the size information. The code should be rewritten like this:

```c++
if (FloatsEqualWithinTolerance(&to_XYZD50.vals[0][0], base::span<const float>(&matrix.vals[0][0], 9), 9,
                                       0.0005f)) {
```
or like this:
```c++
if (FloatsEqualWithinTolerance(&to_XYZD50.vals[0][0], base::make_span(matrix.vals[0][0], 9), 9,
                                       0.0005f)) {
```

## Note
The rewriter also needs to add `#include "base/containers/span.h"` if `base::span` or `base::make_span` is not already included.