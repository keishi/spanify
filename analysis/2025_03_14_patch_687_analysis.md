# Build Failure Analysis: 2025_03_14_patch_687

## First error

../../third_party/blink/renderer/platform/graphics/logging_canvas.cc:215:45: error: invalid operands to binary expression ('std::array<SkPoint, 4>' and 'unsigned int')
  215 |                          UNSAFE_TODO(points + verb_params.point_offset)));
      |                                      ~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter encountered a case where it failed to add .data() when converting a C-style array to std::array in a third_party function call.

## Reason
The original code used a C-style array `SkPoint points[4]`. The spanify tool converted this to `std::array<SkPoint, 4> points;`. The code then tries to add a point offset to the `points` variable, but adding an integer to an `std::array` is invalid. When a C-style array is converted to `std::array`, the rewriter must add `.data()` when the variable is used as a pointer in a third_party function call. In this case `UNSAFE_TODO` is being used on the variable, so the rewriter must add `.data()`.

## Solution
The rewriter must add `.data()` when converting a C-style array to `std::array` when that variable is passed to a third_party function call.
```diff
diff --git a/third_party/blink/renderer/platform/graphics/logging_canvas.cc b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
index ccd0e24a1bd59..600cd70e4a26a 100644
--- a/third_party/blink/renderer/platform/graphics/logging_canvas.cc
+++ b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
@@ -198,10 +200,10 @@ std::unique_ptr<JSONObject> ObjectForSkPath(const SkPath& path) {
   path_item->SetBoolean("convex", path.isConvex());
   path_item->SetBoolean("isRect", path.isRect(nullptr));
   SkPath::RawIter iter(path);
-  SkPoint points[4];
+  std::array<SkPoint, 4> points;
   auto path_points_array = std::make_unique<JSONArray>();
-  for (SkPath::Verb verb = iter.next(points); verb != SkPath::kDone_Verb;
-       verb = iter.next(points)) {
+  for (SkPath::Verb verb = iter.next(points.data()); verb != SkPath::kDone_Verb;
+       verb = iter.next(points.data())) {
     VerbParams verb_params = SegmentParams(verb);
     auto path_point_item = std::make_unique<JSONObject>();
     path_point_item->SetString("verb", verb_params.name);