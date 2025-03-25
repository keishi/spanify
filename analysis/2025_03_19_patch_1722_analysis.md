# Build Failure Analysis: 2025_03_19_patch_1722

## First error

../../media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc:338:26: error: use of undeclared identifier 'cdef_y_pri_strength'
  338 |   for (size_t i = 0; i < ARRAY_SIZE(current_params.cdef_y_pri_strength); i++) {
      |                          ^
../../media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc:45:5: note: expanded from macro 'ARRAY_SIZE'
   45 |   ((cdef_y_pri_strength.size() *                         \
      |     ^

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The rewriter replaced a C-style array with a `std::array`. However, the macro `ARRAY_SIZE` was still being used, which is not compatible with `std::array`.

The original code was:
```c++
uint8_t cdef_y_pri_strength[8] = {9, 12, 0, 6, 2, 4, 1, 2};
...
for (size_t i = 0; i < ARRAY_SIZE(cdef_y_pri_strength); i++) {
```

The rewriter changed it to:
```c++
std::array<uint8_t, 8> cdef_y_pri_strength = {9, 12, 0, 6, 2, 4, 1, 2};
...
for (size_t i = 0; i < ARRAY_SIZE(cdef_y_pri_strength); i++) {
```

The macro `ARRAY_SIZE` is defined as:
```c++
#define ARRAY_SIZE(x) (sizeof(x) / sizeof(x[0]))
```

This code does not work with `std::array` because `x` is expected to be a raw array, not a `std::array`. Thus `cdef_y_pri_strength` is an undeclared identifier.

## Solution
The rewriter needs to be able to replace the macro with `current_params_.cdef_y_pri_strength.size()`:

```c++
-  for (size_t i = 0; i < ARRAY_SIZE(current_params_.cdef_y_pri_strength); i++) {
+  for (size_t i = 0; i < current_params_.cdef_y_pri_strength.size(); i++) {
```

## Note
A similar error exists on line 1011.

```
../../media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc:1011:26: error: use of undeclared identifier 'cdef_y_pri_strength'
 1011 |   for (size_t i = 0; i < ARRAY_SIZE(current_params_.cdef_y_pri_strength); i++) {
      |                          ^
../../media/gpu/vaapi/av1_vaapi_video_encoder_delegate.cc:45:5: note: expanded from macro 'ARRAY_SIZE'
   45 |   ((cdef_y_pri_strength.size() *                         \
      |     ^