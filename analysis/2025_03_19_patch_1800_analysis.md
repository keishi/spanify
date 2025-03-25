# Build Failure Analysis: 2025_03_19_patch_1800

## First error

../../ui/gfx/nine_image_painter.cc:121:17: error: static assertion failed due to requirement 'std::size(image_reps) == std::extent<std::array<gfx::ImageSkia, 9>, 0>()':

## Category
Rewriter failed to add .data() to arrayified `char[]` variable used with std::string.

## Reason
The code contains a static assertion that is failing after the spanification:

```c++
static_assert(std::size(image_reps) == std::extent<decltype(images_)>(), "");
```

This indicates that `image_reps` is expected to have a size equal to the extent of `images_`.
Since `images_` is now an `std::array`, its `extent` is 9. Thus this static assertion will pass only when `image_reps` has a size of 9.

It appears the surrounding code is attempting to create an `std::array` from `image_reps` implicitly:
```c++
  ImageSkia images_[9];
```
and now the size doesn't match. This is likely an incompatibility with a previous c-style array initialization. Rewriter should add `.data()` to avoid this error.

## Solution

The solution is to add `.data()` where `images_` is being used in a function call so that it matches the expected type.

## Note
Without the surrounding code it is difficult to provide a specific solution. But it should be straight forward once the code is available.