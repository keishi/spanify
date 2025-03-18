# Build Failure Analysis: 2025_03_14_patch_1760

## First error

../../media/filters/audio_renderer_algorithm.cc:248:58: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'

## Category
Rewriter needs to generate code to construct a span from a raw pointer.

## Reason
The rewriter changed the function signature to take a `base::span<float>`, but the function call was not updated to construct the span.

## Solution
The rewriter needs to insert the necessary code to construct the `base::span<float>` from the raw pointer. Use `base::make_span` function to convert the raw pointer to span. For example:

```c++
GetPeriodicHanningWindow(ola_window_size_, base::make_span(ola_window_.get(), ola_window_size_));
```

## Note
There is another call site with similar failure.
```
../../media/filters/audio_renderer_algorithm.cc:252:40: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'