```
# Build Failure Analysis: 2025_03_14_patch_1435

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
      |   ~~~~~~~~~~~~~~~~~~^~~

## Category
Rewriter needs to generate code to construct a span from a variable converted to std::array when that variable is passed to a third_party function.

## Reason
The code was changed to use `std::array` instead of a C-style array. The `Run` method expects a pointer as the final parameter, but now it is receiving a `std::array`. The rewriter failed to add `.data()` to pass the pointer to the underlying array data.
The error message says that there is no matching function for call to `Run` because there is no conversion from `std::array` to the pointer type.

## Solution
The rewriter should add `.data()` when that variable is passed to a third_party function call. Specifically, the rewriter needs to rewrite this line:

```c++
std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis, 0 /* start_offset */, &count, chunk);
```

to:

```c++
std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis, 0 /* start_offset */, &count, chunk.data());
```

To implement this fix, the rewriter needs to identify cases where a spanified variable (in this case, `chunk`) is passed as an argument to a function (in this case, `Run`). If the function expects a pointer, the rewriter needs to add `.data()` to the spanified variable to pass a pointer to the underlying data.

## Note
There is a similar error reported in the same file in the build log.
```
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
      |   ~~~~~~~~~~~~~~~~~~^~~
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:239:7: note: in instantiation of function template specialization 'blink::GetHarfBuzzMathRecord<hb_ot_math_glyph_part_t, blink::OpenTypeMathStretchData::GlyphPartRecord>' requested here
  239 |       GetHarfBuzzMathRecord(
      |       ^
```
This error happens in a similar context.

```
# Build Failure Analysis: 2025_03_14_patch_1435

## First error

../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
      |   ~~~~~~~~~~~~~~~~~~^~~

## Category
Rewriter needs to generate code to construct a span from a variable converted to std::array when that variable is passed to a third_party function.

## Reason
The code was changed to use `std::array` instead of a C-style array. The `Run` method expects a pointer as the final parameter, but now it is receiving a `std::array`. The rewriter failed to add `.data()` to pass the pointer to the underlying array data.
The error message says that there is no matching function for call to `Run` because there is no conversion from `std::array` to the pointer type.

## Solution
The rewriter should add `.data()` when that variable is passed to a third_party function call. Specifically, the rewriter needs to rewrite this line:

```c++
std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis, 0 /* start_offset */, &count, chunk);
```

to:

```c++
std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis, 0 /* start_offset */, &count, chunk.data());
```

To implement this fix, the rewriter needs to identify cases where a spanified variable (in this case, `chunk`) is passed as an argument to a function (in this case, `Run`). If the function expects a pointer, the rewriter needs to add `.data()` to the spanified variable to pass a pointer to the underlying data.

## Note
There is a similar error reported in the same file in the build log.
```
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:176:21: error: no matching member function for call to 'Run'
  176 |   std::move(getter).Run(hb_font, base_glyph, hb_stretch_axis,
      |   ~~~~~~~~~~~~~~~~~~^~~
../../third_party/blink/renderer/platform/fonts/opentype/open_type_math_support.cc:239:7: note: in instantiation of function template specialization 'blink::GetHarfBuzzMathRecord<hb_ot_math_glyph_part_t, blink::OpenTypeMathStretchData::GlyphPartRecord>' requested here
  239 |       GetHarfBuzzMathRecord(
      |       ^
```
This error happens in a similar context.