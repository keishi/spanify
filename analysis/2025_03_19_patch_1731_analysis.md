# Build Failure Analysis: 2025_03_19_patch_1731

## First error

../../media/renderers/shared_image_video_frame_test_utils.cc:131:24: error: no viable conversion from 'const value_type' (aka 'const std::array<const unsigned char, 3>') to 'const uint8_t *' (aka 'const unsigned char *')

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The code is trying to assign an element of `kYuvColors`, which is now a `std::array<std::array<const uint8_t, 3>, 8>`, to a `const uint8_t*`. The correct way to get a pointer to the underlying data is to use `.data()`.

## Solution
The rewriter needs to add `.data()` to the return value of `kYuvColors[color_index]`. For example,
```
-    const uint8_t* yuv = kYuvColors[color_index];
+    const uint8_t* yuv = kYuvColors[color_index].data();
```

## Note
The second error is the same, and fixing the first error will likely fix the second one as well.
```
../../media/renderers/shared_image_video_frame_test_utils.cc:219:24: error: no viable conversion from 'const value_type' (aka 'const std::array<const unsigned char, 3>') to 'const uint8_t *' (aka 'const unsigned char *')
  219 |         const uint8_t* yuv = kYuvColors[color_index];
      |                        ^     ~~~~~~~~~~~~~~~~~~~~~~~