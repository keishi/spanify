# Build Failure Analysis: 2025_03_16_patch_1260

## First error

../../third_party/blink/renderer/platform/fonts/simple_font_data.cc:473:39: error: no viable overloaded '='

## Category
Rewriter needs to avoid generating assignment operations on `std::array` when the array is a const member.

## Reason
The rewriter changes the member `han_kerning_cache_` from a mutable C-style array to a non-mutable `std::array`.
```c++
  struct HanKerningCacheEntry {
    bool is_horizontal;
    HanKerning::FontData data;
  };
-  mutable HanKerningCacheEntry han_kerning_cache_[2];
+  std::array<HanKerningCacheEntry, 2> han_kerning_cache_;
```

But the original C++ code is assigning values to that member in a const method.
```c++
void SimpleFontData::UpdateHanKerningCache(
    bool is_horizontal,
    const HanKerning::FontData& font_data) const {
  if (han_kerning_cache_[0].is_horizontal == is_horizontal &&
      han_kerning_cache_[0].data == font_data)
    return;

  han_kerning_cache_[1] = han_kerning_cache_[0];  // ERROR HERE
  UNSAFE_TODO(han_kerning_cache_[0] = std::move(han_kerning_cache_[1]));

  HanKerningCacheEntry& new_entry = han_kerning_cache_[0]; // ERROR HERE
  new_entry.is_horizontal = is_horizontal;
  new_entry.data = font_data;
}
```
Since the `UpdateHanKerningCache` method is `const`, `han_kerning_cache_` can't be modified via assignment.

## Solution
The rewriter should consider adding the `mutable` keyword to the `han_kerning_cache_` field, or determine the code is modifying const variables and not attempt the spanification.

## Note
The code also fails because after arrayification the HanKerningCacheEntry struct cannot be assigned to a reference:
```
../../third_party/blink/renderer/platform/fonts/simple_font_data.cc:475:25: error: binding reference of type 'HanKerningCacheEntry' to value of type 'const value_type' (aka 'const blink::SimpleFontData::HanKerningCacheEntry') drops 'const' qualifier
  HanKerningCacheEntry& new_entry = han_kerning_cache_[0];