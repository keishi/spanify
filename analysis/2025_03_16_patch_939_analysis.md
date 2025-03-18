# Build Failure Analysis: 2025_03_16_patch_939

## First error

../../cc/paint/render_surface_filters.cc:168:43: error: member reference base type 'float[20]' is not a structure or union
  168 |             CreateMatrixImageFilter(matrix.data(), std::move(image_filter));
      |                                     ~~~~~~^~~~~

## Category
Rewriter needs to transform C-style arrays into pointers when calling third_party code.

## Reason
`GetBrightnessMatrix` etc has been spanified, however `CreateMatrixImageFilter` takes a C-style array as input, so we must pass a pointer.

## Solution
The rewriter needs to add `.data()` to the span to get a pointer to pass to `CreateMatrixImageFilter`.

## Note
All calls to Get{Brightness,SaturatingBrightness,Contrast,Saturate,HueRotate,Invert,Opacity,Grayscale,Sepia}Matrix pass a C-style array of floats called matrix to these methods, which in turn calls CreateMatrixImageFilter and causes the same error.