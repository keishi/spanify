# Build Failure Analysis: 2025_05_02_patch_603

## First error

../../components/viz/service/display/software_renderer.cc:324:46: error: member reference base type 'SkPoint[4]' is not a structure or union
  324 |     draw_region_clip_path.addPoly(clip_points.data(), 4, true);
      |                                   ~~~~~~~~~~~^~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The rewriter converted `SkPoint clip_points[4]` to `base::span<SkPoint, 4> clip_points`, but it failed to rewrite the call to `draw_region_clip_path.addPoly(clip_points, 4, true)` correctly. The `addPoly` function in Skia expects a raw pointer as the first argument, but it is receiving a `base::span`. The rewriter should have added `.data()` to `clip_points` to pass the underlying pointer to the function. Since `SkPath::addPoly` is third party code, the rewriter is not allowed to rewrite it and has to rewrite the parameter instead.

## Solution
The rewriter needs to add `.data()` to the spanified `clip_points` when calling `draw_region_clip_path.addPoly()`. The corrected code should look like this:

```c++
draw_region_clip_path.addPoly(clip_points.data(), 4, true);
```

## Note
No further errors found.