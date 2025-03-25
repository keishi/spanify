# Build Failure Analysis: 2025_03_19_patch_1811

## First error

../../third_party/blink/renderer/modules/webcodecs/audio_data.cc:664:39: error: reinterpret_cast from 'base::span<uint8_t>' (aka 'span<unsigned char>') to 'int32_t *' (aka 'int *') is not allowed

## Category
Rewriter needs to avoid using reinterpret_cast on spanified variable.

## Reason
The rewriter spanified a variable but left a reinterpret_cast that is applied to it. The code is trying to cast a span of bytes to a span of int32_t.

## Solution
Rewriter needs to be able to remove it. One possible solution is to remove the cast and use `base::MakeSpan` to achieve the same functionality:
```c++
-      int32_t* dest_data = reinterpret_cast<int32_t*>(dest.data());
+     base::span<int32_t> dest_data = base::MakeSpan(reinterpret_cast<int32_t*>(dest.data()), dest.size()/sizeof(int32_t));
```

## Note
The same code pattern is found in the code.
```
media::kSampleFormatPlanarS32: {
-     int32_t* dest_data = reinterpret_cast<int32_t*>(dest.data());
+     base::span<int32_t> dest_data = reinterpret_cast<int32_t*>(dest);