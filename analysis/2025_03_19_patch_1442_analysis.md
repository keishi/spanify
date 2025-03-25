# Build Failure Analysis: 2025_03_19_patch_1442

## First error

../../components/viz/test/gl_scaler_test_util.cc:316:32: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'const base::span<uint32_t>' (aka 'const span<unsigned int>')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The return value `out->getAddr32(0, y)` is a raw pointer which the rewriter failed to add `.data()` when assigning it to a `base::span`.

## Solution
Add `.data()` to the right hand side of the assignment.

```diff
--- a/components/viz/test/gl_scaler_test_util.cc
+++ b/components/viz/test/gl_scaler_test_util.cc
@@ -2,6 +8,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include "base/containers/span.h"
+
 #ifdef UNSAFE_BUFFERS_BUILD
 // TODO(crbug.com/40285824): Remove this and convert code to safer constructs.
 #pragma allow_unsafe_buffers
@@ -311,7 +313,7 @@ void GLScalerTestUtil::UnpackPlanarBitmap(const SkBitmap& plane,
   // of |plane|'s pixels.
   for (int y = 0; y < out->height(); ++y) {
     const uint32_t* const src = plane.getAddr32(0, y / row_sampling_ratio);
-    uint32_t* const dst = out->getAddr32(0, y);
+    const base::span<uint32_t> dst = out->getAddr32(0, y).data();
     for (int x = 0; x < out->width(); ++x) {
       // Zero-out the existing byte (e.g., if channel==1, then "RGBA" → "R0BA").
       dst[x] &= output_retain_mask;