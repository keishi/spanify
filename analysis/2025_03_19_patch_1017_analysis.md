# Build Failure Analysis: 2025_03_19_patch_1017

## First error

../../third_party/blink/renderer/platform/graphics/static_bitmap_image_transform.cc:45:23: error: no viable conversion from 'uint8_t *' (aka 'unsigned char *') to 'base::span<uint8_t>' (aka 'span<unsigned char>')

## Category
Rewriter needs to cast pointer type before assigning to span

## Reason
`pm.writable_addr()` returns a `void*`. This is then being cast to `uint8_t*`. `base::span` has an implicit conversion from raw pointers, but not from `void*`, so it needs a `reinterpret_cast`.

## Solution
Rewriter needs to cast the `void*` to `uint8_t*` inside the `span`.

```c++
base::span<uint8_t> data = base::span(reinterpret_cast<uint8_t*>(pm.writable_addr()), size);