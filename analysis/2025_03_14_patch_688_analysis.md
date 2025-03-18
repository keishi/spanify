# Build Failure Analysis: 2025_03_14_patch_688

## First error

../../third_party/blink/renderer/platform/graphics/logging_canvas.cc:574:23: error: member reference base type 'SkScalar[16]' (aka 'float[16]') is not a structure or union
  574 |   matrix.getColMajor(m.data());
      |                      ~^~~~~

## Category
Rewriter needs to handle `.data()` when calling non-third-party methods on C-style arrays.

## Reason
The rewriter has attempted to spanify the `SkScalar m[16]` array, but is only partially successful. The code changes introduce a `base::span<const SkScalar> array` parameter, but the calls to `matrix.getColMajor()` now expect a `float*` and the code was modified to pass `m.data()`. However, matrix.getColMajor() is not a third party function. The proper fix is to spanify m[].

## Solution
The rewriter should rewrite the array `SkScalar m[16]` to `std::array<SkScalar, 16> m;`. This will allow passing `m.data()` as argument to `matrix.getColMajor()`.
```c++
diff --git a/third_party/blink/renderer/platform/graphics/logging_canvas.cc b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
index ccd0e24a1bd59..8c4d7b08f772f 100644
--- a/third_party/blink/renderer/platform/graphics/logging_canvas.cc
+++ b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
@@ -571,14 +571,14 @@ void LoggingCanvas::onDrawPicture(const SkPicture* picture,
 
 void LoggingCanvas::didSetM44(const SkM44& matrix) {
   SkScalar m[16];
-  matrix.getColMajor(m);
+  matrix.getColMajor(m.data());
   AutoLogger logger(this);
   JSONObject* params = logger.LogItemWithParams("setMatrix");
   params->SetArray("matrix44", ArrayForSkScalars(16, m));
 
 void LoggingCanvas::didConcat44(const SkM44& matrix) {
   SkScalar m[16];
-  matrix.getColMajor(m);
+  matrix.getColMajor(m.data());
   AutoLogger logger(this);
   JSONObject* params = logger.LogItemWithParams("concat44");
   params->SetArray("matrix44", ArrayForSkScalars(16, m));
```

to:

```c++
diff --git a/third_party/blink/renderer/platform/graphics/logging_canvas.cc b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
index ccd0e24a1bd59..8c4d7b08f772f 100644
--- a/third_party/blink/renderer/platform/graphics/logging_canvas.cc
+++ b/third_party/blink/renderer/platform/graphics/logging_canvas.cc
@@ -571,14 +571,14 @@ void LoggingCanvas::onDrawPicture(const SkPicture* picture,
 
 void LoggingCanvas::didSetM44(const SkM44& matrix) {
-  SkScalar m[16];
+  std::array<SkScalar, 16> m;
   matrix.getColMajor(m);
   AutoLogger logger(this);
   JSONObject* params = logger.LogItemWithParams("setMatrix");
   params->SetArray("matrix44", ArrayForSkScalars(16, m));
 
 void LoggingCanvas::didConcat44(const SkM44& matrix) {
-  SkScalar m[16];
+  std::array<SkScalar, 16> m;
   matrix.getColMajor(m.data());
   AutoLogger logger(this);
   JSONObject* params = logger.LogItemWithParams("concat44");
   params->SetArray("matrix44", ArrayForSkScalars(16, m));
```

## Note
There are two distinct errors due to `m.data()` and they are both addressed by spanifying `m` to use std::array.