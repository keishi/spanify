# Build Failure Analysis: 36

## First error

../../ui/gfx/geometry/rrect_f.cc:116:14: error: out-of-line definition of 'GetAllRadii' does not match any declaration in 'gfx::RRectF'
  116 | void RRectF::GetAllRadii(base::span<SkVector, 4> radii) const {
      |              ^~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the function declaration in the definition file, but it failed to spanify the function declaration in the header file.

## Solution
The rewriter should spanify the function declaration in the header file as well.

```c++
--- a/ui/gfx/geometry/rrect_f.h
+++ b/ui/gfx/geometry/rrect_f.h
@@ -178,7 +178,7 @@
   SkVector GetCornerRadii(Corner corner) const;
 
   // Returns all radii of the rrect.
-  void GetAllRadii(SkVector radii[4]) const;
+  void GetAllRadii(base::span<SkVector, 4> radii) const;
 
   // Sets the radii for a given corner. This will lazily instantiate
   // the SkRRect if it hasn't already been created.

```

## Note
The second error is a consequence of the first.