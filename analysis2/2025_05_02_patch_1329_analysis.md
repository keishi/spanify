# Build Failure Analysis: 2025_05_02_patch_1329

## First error

../../ui/base/clipboard/clipboard_test_template.h:652:7: error: no matching function for call to 'TestBitmapWriteAndPngRead'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `TestBitmapWriteAndPngRead` function in `clipboard_test_template.h`.

```c++
void AssertBitmapMatchesExpected(const SkBitmap& image,
                                  const SkImageInfo& info,
                                 base::span<const U8x4> expect_data)
```

However, the call site `TestBitmapWriteAndPngRead` is passing a raw pointer `const U8x4* expect_data`:

```c++
TestBitmapWriteAndPngRead(
        clipboard, bitmap_info, reinterpret_cast<const void*>(bitmap_data),
        expect_data);
```

The rewriter did not update the call site to create a span from the raw pointer.

## Solution
The rewriter needs to spanify the call sites of functions that have been spanified. The rewriter should convert `expect_data` to a span.

```c++
TestBitmapWriteAndPngRead(
        clipboard, bitmap_info, reinterpret_cast<const void*>(bitmap_data),
        base::span<const U8x4>(expect_data, bitmap_info.width() * bitmap_info.height()));
```

## Note
```