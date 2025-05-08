# Build Failure Analysis: 2025_05_02_patch_1624

## First error

../../ui/wm/core/cursor_util_unittest.cc:99:10: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]

## Category
Rewriter needs to properly handle multi-dimensional `std::array` initialization.

## Reason
The original code used a C-style array for `hotspot`, and the rewriter converted it to a `std::array`. However, the initialization of the `std::array` requires additional braces to properly initialize the nested `std::array<gfx::Point, 2>`. The compiler is suggesting adding these missing braces.

## Solution
The rewriter needs to insert the missing braces during the conversion from C-style array to `std::array` when dealing with nested arrays.
In this case, the rewriter must generate:
```c++
   std::array<std::array<gfx::Point, 2>, 2>
        hotspot = {{{gfx::Point(4, 4), gfx::Point(7, 7)},
                    {gfx::Point(10, 10), gfx::Point(20, 20)}}};
```
instead of:
```c++
   std::array<std::array<gfx::Point, 2>, 2>
        hotspot = {{gfx::Point(4, 4), gfx::Point(7, 7)},
                    {gfx::Point(10, 10), gfx::Point(20, 20)}};
```

## Note
The errors regarding "excess elements in struct initializer" are a consequence of the missing braces in the initialization of the `std::array`. Once the braces are added, these errors should disappear.