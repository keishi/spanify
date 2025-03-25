# Build Failure Analysis: 2025_03_19_patch_1986

## First error
../../ui/wm/core/cursor_util_unittest.cc:100:10: error: suggest braces around initialization of subobject [-Werror,-Wmissing-braces]
  100 |        {{gfx::Point(4, 4), gfx::Point(7, 7)},

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The code initializes a `std::array<std::array<gfx::Point, 2>, 2> hotspot` using a nested initializer list without explicit braces for the inner `gfx::Point` objects. The compiler suggests adding braces around the initialization of the subobjects `gfx::Point(4, 4)` and `gfx::Point(7, 7)`. This is because the initialization style is ambiguous and can lead to unexpected behavior.

## Solution
The rewriter should add explicit braces to the inner initializers to resolve the ambiguity.
The code should be rewritten as:

```c++
   {CursorType::kPointer,
       {gfx::Size(25, 25), gfx::Size(64, 64)},
-      {{gfx::Point(4, 4), gfx::Point(7, 7)},
-       {gfx::Point(10, 10), gfx::Point(20, 20)}}},
+      {{{gfx::Point(4, 4), gfx::Point(7, 7)}},
+       {{gfx::Point(10, 10), gfx::Point(20, 20)}}}}},
```

## Note
The build failure also includes `error: excess elements in struct initializer`. After fixing the `missing-braces` error, this secondary error will likely be resolved automatically, or require the deletion of the extra curly braces.