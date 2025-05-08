# Build Failure Analysis: 2025_05_02_patch_50

## First error

../../third_party/blink/renderer/platform/graphics/gpu/webgl_image_conversion_test.cc:95:16: error: no viable conversion from 'uint16_t *' (aka 'unsigned short *') to 'base::span<const uint16_t>' (aka 'span<const unsigned short>')

## Category
Pointer passed into spanified function parameter.

## Reason
The `UnpackPixels` function was spanified, but the call site in `WebGLImageConversionTest::convertBGRA8toRGBA8` was not updated to use spans.

```
TEST_F(WebGLImageConversionTest, convertBGRA8toRGBA8) {
  uint32_t source_data[9] = {0x12345678, 0x23456789, 0x3456789A,
                               0x456789AB, 0x56789ABC, 0x6789ABCD,
                               0x789ABCDE, 0x89ABCDEF, 0x9ABCDE12};
#if defined(ARCH_CPU_LITTLE_ENDIAN)
  uint32_t expected_data[9] = {0x78563412, 0x89674523, 0x9A785634,
                                0xAB896745, 0xBC9A7856, 0xCDAB8967,
                                0xDEBC9A78, 0xEFCDAB89, 0x12DEBC9A};
#else
  uint32_t expected_data[9] = {0x12785634, 0x23896745, 0x349A7856,
                                0x45AB8967, 0x56BC9A78, 0x67CDAB89,
                                0x78DEBC9A, 0x89EFCDAB, 0x9ABCDE12};
#endif
  uint32_t destination_data[9];
  UnpackPixels(reinterpret_cast<uint16_t*>(&source_data[0]),
               WebGLImageConversion::kDataFormatBGRA8, 9,
               reinterpret_cast<uint8_t*>(&destination_data[0]));
  EXPECT_EQ(0,
            memcmp(destination_data, expected_data, sizeof(destination_data)));
}
```

The first argument to the `UnpackPixels` function is a raw pointer that needs to be converted to a span.

## Solution
The rewriter should spanify the call site, creating a span from the underlying array:

```
TEST_F(WebGLImageConversionTest, convertBGRA8toRGBA8) {
  uint32_t source_data[9] = {0x12345678, 0x23456789, 0x3456789A,
                               0x456789AB, 0x56789ABC, 0x6789ABCD,
                               0x789ABCDE, 0x89ABCDEF, 0x9ABCDE12};
#if defined(ARCH_CPU_LITTLE_ENDIAN)
  uint32_t expected_data[9] = {0x78563412, 0x89674523, 0x9A785634,
                                0xAB896745, 0xBC9A7856, 0xCDAB8967,
                                0xDEBC9A78, 0xEFCDAB89, 0x12DEBC9A};
#else
  uint32_t expected_data[9] = {0x12785634, 0x23896745, 0x349A7856,
                                0x45AB8967, 0x56BC9A78, 0x67CDAB89,
                                0x78DEBC9A, 0x89EFCDAB, 0x9ABCDE12};
#endif
  uint32_t destination_data[9];
  UnpackPixels(base::span<const uint16_t>(reinterpret_cast<uint16_t*>(source_data), 9 * 2),
               WebGLImageConversion::kDataFormatBGRA8, 9,
               reinterpret_cast<uint8_t*>(&destination_data[0]));
  EXPECT_EQ(0,
            memcmp(destination_data, expected_data, sizeof(destination_data)));
}
```

## Note
The diff shows the function `UnpackPixels` was spanified:

```
-  void UnpackPixels(const uint16_t* source_data,
+  void UnpackPixels(base::span<const uint16_t> source_data,