# Build Failure Analysis: 2025_03_19_patch_1613

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The code uses `height * width - 1` as an argument to `subspan()`. The result of this multiplication is of type `int`, but `subspan` expects an unsigned value. The compiler is unable to find a suitable `strict_cast` to convert the `int` to an unsigned value because the range of `int` is not guaranteed to be contained within the range of `unsigned long`.

## Solution
Cast the expression `height * width - 1` to `size_t` before passing it to `subspan()`. For example:

```c++
dest = dest.subspan(static_cast<size_t>(height * width - 1));
```

This will ensure that the argument passed to subspan() is of the correct type.

## Note
There are other similar errors.
```
../../media/base/video_util.cc:364:38: error: expected expression
  364 |         dest = dest.subspan(width * () height - 1);
      |                                      ^
../../media/base/video_util.cc:368:16: error: no viable overloaded '-='
  368 |           dest -= width;
      |           ~~~~ ^  ~~~~~
../../media/base/video_util.cc:391:34: error: invalid operands to binary expression ('span<element_type>' (aka 'span<unsigned char>') and 'int')
  391 |         dest=dest.subspan(width) > height ? width * (height - 1) + offset :
      |              ~~~~~~~~~~~~~~~~~~~ ^ ~~~~~~
../../media/base/video_util.cc:392:64: error: extraneous ')' before ';'
  392 |                                   width * (height - offset - 1));
      |                                                                ^
../../media/base/video_util.cc:394:34: error: invalid operands to binary expression ('span<element_type>' (aka 'span<unsigned char>') and 'int')
  394 |         dest=dest.subspan(width) > height ? offset : width * offset);
      |              ~~~~~~~~~~~~~~~~~~~ ^ ~~~~~~
../../media/base/video_util.cc:399:65: error: extraneous ')' before ';'
  399 |                                    width * (height - offset) - 1);
      |                                                                 ^
../../media/base/video_util.cc:401:34: error: invalid operands to binary expression ('span<element_type>' (aka 'span<unsigned char>') and 'int')
  401 |         dest=dest.subspan(width) > height ? width - offset - 1 :
      |              ~~~~~~~~~~~~~~~~~~~ ^ ~~~~~~
```
Rewriter also needs to correct the order of subspan and comparator. All `data()` calls are also dropped. The diff should look like this:
```diff
--- a/media/base/video_util.cc
+++ b/media/base/video_util.cc
@@ -361,10 +361,10 @@
       if (flip_vert) {
         // Rotation 180.
         dest_row_step = -width;
-        dest += height * width - 1;
+        dest = dest.subspan(static_cast<size_t>(height * width - 1));
       } else {
-        dest += width - 1;
+        dest = dest.subspan(static_cast<size_t>(width - 1));
       }
     } else {
       if (flip_vert) {
@@ -376,13 +376,13 @@
           dest -= width;
         }
       } else {
-        memcpy(dest, src, width * height);
+        memcpy(dest.data(), src, static_cast<size_t>(width * height));
       }
       return;
     }
@@ -393,18 +393,18 @@
     dest_row_step = (flip_horiz ? 1 : -1);
     if (flip_horiz) {
       if (flip_vert) {
-        dest += (width > height ? width * (height - 1) + offset :
+        dest = (dest.size() > height ? dest.subspan(static_cast<size_t>(width * (height - 1) + offset)) :
                                    width * (height - offset - 1));
       } else {
-        dest += (width > height ? offset : width * offset);
+        dest = (dest.size() > height ? dest.subspan(static_cast<size_t>(offset)) : dest.subspan(static_cast<size_t>(width * offset)));
       }
     } else {
       if (flip_vert) {
-        dest += (width > height ?  width * height - offset - 1 :
+        dest = (dest.size() > height ? dest.subspan(static_cast<size_t>(width * height - offset - 1)) :
                                    width * (height - offset) - 1);
       } else {
-        dest += (width > height ? width - offset - 1 :
+        dest = (dest.size() > height ? dest.subspan(static_cast<size_t>(width - offset - 1)) :
                                    width * (offset + 1) - 1);
       }
     }