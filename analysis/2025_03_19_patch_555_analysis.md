# Build Failure Analysis: 2025_03_19_patch_555

## First error

../../media/filters/ffmpeg_demuxer.cc:481:32: error: no viable conversion from 'const uint32_t *' (aka 'const unsigned int *') to 'base::span<const uint32_t>' (aka 'span<const unsigned int>')
  481 |     base::span<const uint32_t> skip_samples_ptr =
      |                                ^
  482 |         reinterpret_cast<const uint32_t*>(av_packet_get_side_data(
      |         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  483 |             packet.get(), AV_PKT_DATA_SKIP_SAMPLES, &skip_samples_size));
      |             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The code attempts to initialize a `base::span<const uint32_t>` with a raw pointer obtained from `av_packet_get_side_data`. The rewriter spanified the variable, but failed to recognize the size info unavailable rhs value.

## Solution
The rewriter should be able to handle the case where a raw pointer with no size information is returned from a function. A potential solution would be to wrap the raw pointer with `base::make_span` with a size argument calculated from `skip_samples_size` if available.

## Note
The second error is related to the first one because after fixing the conversion, a cast is needed to an unsigned value before calling `.subspan()`.
```
../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'
  271 |   constexpr StrictNumeric(Src value) : value_(strict_cast<T>(value)) {}
      |                                               ^~~~~~~~~~~~~~