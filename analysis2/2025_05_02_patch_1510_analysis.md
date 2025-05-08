# Build Failure Analysis: 2025_05_02_patch_1510

## First error

../../ui/gfx/render_text.cc:375:71: error: indirection requires pointer operand ('base::span<const SkPoint>' invalid)

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code now uses `base::span<const SkPoint> pos`, but the `sizeof(*pos)` is trying to dereference `pos` as a pointer.  The `pos` variable is a span, so it should be `sizeof(pos[0])` instead.

## Solution
Change `sizeof(*pos)` to `sizeof(pos[0])` in the memcpy line.

```diff
--- a/ui/gfx/render_text.cc
+++ b/ui/gfx/render_text.cc
@@ -372,7 +372,7 @@ void SkiaTextRenderer::DrawPosText(base::span<const SkPoint> pos,
   static_assert(sizeof(*glyphs) == sizeof(*run_buffer.glyphs), "");
   UNSAFE_TODO(memcpy(run_buffer.glyphs, glyphs, glyph_count * sizeof(*glyphs)));
 
-  static_assert(sizeof(*pos) == 2 * sizeof(*run_buffer.pos), "");
+  static_assert(sizeof(pos[0]) == 2 * sizeof(*run_buffer.pos), "");
   UNSAFE_TODO(memcpy(run_buffer.pos, pos.data(), glyph_count * sizeof(*pos)));
 
   canvas_skia_->drawTextBlob(builder.make(), 0, 0, flags_);
```

## Note
The code change also introduced `base::span` in `ui/gfx/render_text.h` but it wasn't really used there. It could be removed to avoid unnecessary includes.
```diff
--- a/ui/gfx/render_text.h
+++ b/ui/gfx/render_text.h
@@ -17,7 +17,6 @@
 #include <iosfwd>
 #include <memory>
 #include <string>
-#include "base/containers/span.h"
 #include "base/i18n/rtl.h"
 #include "base/memory/raw_ptr.h"
 #include "build/build_config.h"