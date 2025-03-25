# Build Failure Analysis: 2025_03_19_patch_1052

## First error

../../ui/gfx/skbitmap_operations.cc:549:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter converted `source_row` to a `base::span<uint32_t>`, but `source.getAddr32(0, y_pix)` returns a `uint32_t*`. The rewriter needs to generate code to construct a span from the return value of `source.getAddr32(0, y_pix)`.

## Solution
The rewriter needs to generate code to construct a span from the return value of third_party functions like `SkBitmap::getAddr32`. It seems like a size for the span is not available, so we should not try to generate span.

```diff
--- a/ui/gfx/skbitmap_operations.cc
+++ b/ui/gfx/skbitmap_operations.cc
@@ -2,6 +2,8 @@
 // Use of this source code is governed by a BSD-style license that can be
 // found in the LICENSE file.
 
+#include <memory>
+
 #include "base/containers/span.h"
 
 #ifdef UNSAFE_BUFFERS_BUILD
@@ -544,7 +546,7 @@
     while (y_pix < 0)
       y_pix += source.height();
 
-    uint32_t* source_row = source.getAddr32(0, y_pix);
+    uint32_t* source_row = source.getAddr32(0, y_pix); //Third party code.
     uint32_t* dst_row = cropped.getAddr32(0, y);
  
     for (int x = 0; x < dst_w; ++x) {