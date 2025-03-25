# Build Failure Analysis: 2025_03_19_patch_885

## First error

../../ui/gtk/gtk_util.cc:328:23: error: no viable conversion from 'SkColor *' (aka 'unsigned int *') to 'base::span<SkColor>' (aka 'span<unsigned int>')

## Category
Rewriter needs to construct a span from the return value of a third_party function.

## Reason
The code attempts to assign a raw pointer returned from `cairo_image_surface_get_data` to a `base::span`. The rewriter failed to generate code to explicitly construct a `base::span` from this raw pointer and its size. It requires a constructor that accepts a pointer and a size, or `base::make_span`. The size information is available from `width * height`.

## Solution
Rewriter needs to generate code to explicitly construct a `span` from a raw pointer and size:

```c++
base::span<SkColor> data = base::span<SkColor>(reinterpret_cast<SkColor*>(cairo_image_surface_get_data(surface_)), width * height);
```
or
```c++
base::span<SkColor> data = base::make_span(reinterpret_cast<SkColor*>(cairo_image_surface_get_data(surface_)), width * height);
```

## Note
It seems the return type is also not const. So we can use a MutableSpan instead.
```c++
base::span<SkColor, dynamic_extent, SkColor> data = base::make_span(reinterpret_cast<SkColor*>(cairo_image_surface_get_data(surface_)), width * height);