# Build Failure Analysis: 2025_03_14_patch_592

## First error

../../media/filters/ffmpeg_demuxer.cc:481:32: error: no viable conversion from 'const uint32_t *' (aka 'const unsigned int *') to 'base::span<const uint32_t>' (aka 'span<const unsigned int>')

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
`av_packet_get_side_data` is a third party function that returns a raw pointer. The rewriter spanified `skip_samples_ptr` but doesn't generate the code to construct a span from the raw pointer return value.

## Solution
The rewriter should generate code to construct a span from the raw pointer. In this case, the size is known (`skip_samples_size`) so it should use that value to construct a span. The type returned by `av_packet_get_side_data` is a `uint8_t*` but we want a `uint32_t`. So a `reinterpret_cast` is needed, followed by construction of the span.
```c++
-   base::span<const uint32_t> skip_samples_ptr =
-       reinterpret_cast<const uint32_t*>(av_packet_get_side_data(
-           packet.get(), AV_PKT_DATA_SKIP_SAMPLES, &skip_samples_size));
+  const uint8_t* skip_samples_data = av_packet_get_side_data(
+      packet.get(), AV_PKT_DATA_SKIP_SAMPLES, &skip_samples_size);
+  base::span<const uint32_t> skip_samples_ptr = base::span<const uint32_t>(
+      reinterpret_cast<const uint32_t*>(skip_samples_data),
+      skip_samples_size / sizeof(uint32_t));
```

## Note
There's also a second error caused by `.subspan()` being passed `kSkipEndSamplesOffset` as an `int` which needs to be `size_t` instead.

```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}

```

This is also a problem of implicit cast, and this change should fix it:

```c++
-          (skip_samples_ptr.subspan(kSkipEndSamplesOffset)[0]));
+          (skip_samples_ptr.subspan(static_cast<size_t>(kSkipEndSamplesOffset))[0]));