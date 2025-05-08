# Build Failure Analysis: 2025_05_02_patch_5

## First error

../../components/pwg_encoder/bitmap_image.cc:36:10: error: no viable conversion from returned value of type 'pointer' (aka 'unsigned char *') to function return type 'const base::span<uint8_t>' (aka 'const span<unsigned char>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The function `BitmapImage::GetPixel` is declared to return `const base::span<uint8_t>`, but the code is directly returning a raw pointer (`uint8_t*`).  The rewriter is failing to convert the raw pointer to a `base::span` before returning. The returned `uint8_t*` is the result of pointer arithmetic on the `data_` member, which is a `std::unique_ptr<uint8_t[]>`. Since the size of the pixel data is known from the `BitmapImage::size_` member, the rewriter could generate a span from the pointer and the image size.

## Solution
The rewriter needs to generate code to explicitly construct a `base::span` from the raw pointer and a calculated size, before returning.

```c++
const base::span<uint8_t> BitmapImage::GetPixel(const gfx::Point& point) const {
  DCHECK_LT(point.x(), size_.width());
  DCHECK_LT(point.y(), size_.height());
  uint8_t* pixel_ptr = data_.get() + (point.y() * size_.width() + point.x()) * channels();
  size_t pixel_size = channels(); // Or whatever the correct pixel size is
  return base::span<uint8_t>(pixel_ptr, pixel_size);
}
```
The rewriter needs to use the channels() value to correctly specify the span length.

## Note
The error occurs in `components/pwg_encoder/bitmap_image.cc`.