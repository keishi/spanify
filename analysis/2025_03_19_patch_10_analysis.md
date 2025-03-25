# Build Failure Analysis: 2025_03_19_patch_10

## First error
../../chrome/browser/bookmarks/bookmark_html_writer_unittest.cc:69:24: error: no viable conversion from 'uint32_t *' (aka 'unsigned int *') to 'base::span<uint32_t>' (aka 'span<unsigned int>')
   69 |   base::span<uint32_t> src_data = bmp.getAddr32(0, 0);
      |                        ^          ~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code calls `bmp.getAddr32(0, 0)` which is a third_party function, and attempts to assign the return value which is `uint32_t*` to a `base::span<uint32_t>`. The rewriter needs to generate code to create the span.

## Solution
The rewriter should generate code to construct a span from the return value of the third_party function.  Since the size is unknown, it should just create a span with dynamic size.

```c++
base::span<uint32_t> src_data = base::span<uint32_t>(bmp.getAddr32(0, 0), bmp.width() * bmp.height());
```

## Note
SkBitmap::getAddr32 is third_party code.