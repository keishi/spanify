# Build Failure Analysis: 2025_05_02_patch_378

## First error

../../testing/libfuzzer/proto/skia_image_filter_proto_converter.cc:1076:9: error: cannot increment value of type 'base::span<uint8_t>' (aka 'span<unsigned char>')
 1076 |     (dst++)[0] = (uint8_t)(n + 127);
      |      ~~~^

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The code is trying to use `dst++` where dst is a `base::span`. The `base::span` doesn't overload the `++` operator in the same way a pointer does, thus it is an invalid usage.

## Solution
Instead of incrementing `dst` directly, increment a pointer to the data pointed to by the span and then create a new span from the incremented pointer. Replace:
```c++
(dst++)[0] = (uint8_t)(n + 127);
```
with:
```c++
dst[0] = (uint8_t)(n + 127);
dst = dst.subspan(1);
```

## Note
There are other errors. This is likely happening in other locations. `dst - origDst` at the end will also have to be updated to `dst.data() - origDst`