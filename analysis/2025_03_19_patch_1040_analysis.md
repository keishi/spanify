# Build Failure Analysis: 2025_03_19_patch_1040

## First error

../../ui/gfx/skbitmap_operations.cc:47:26: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
   47 |     base::span<uint32_t> image_row = image.getAddr32(0, y);

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The third party code `image.getAddr32(0, y)` returns a raw pointer. The rewriter is attempting to assign this raw pointer directly to a span, which requires a conversion or construction. Because the size information is unknown, this results in a compile error.

## Solution
Wrap the third party return value to construct a span.  This can be done by adding { , width } after the call, but the width should not be hardcoded.

```diff
--- a/ui/gfx/skbitmap_operations.cc
+++ b/ui/gfx/skbitmap_operations.cc
@@ -44,7 +44,7 @@
   inverted.allocN32Pixels(image.width(), image.height());
 
   for (int y = 0; y < image.height(); ++y) {
-    uint32_t* image_row = image.getAddr32(0, y);
+    base::span<uint32_t> image_row = { image.getAddr32(0, y), image.width() };
     uint32_t* dst_row = inverted.getAddr32(0, y);
 
     for (int x = 0; x < image.width(); ++x) {

```

## Note
The hardcoded image.width() should be passed into a variable, or a static constant.