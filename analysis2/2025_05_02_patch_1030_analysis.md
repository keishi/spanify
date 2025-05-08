# Build Failure Analysis: 2025_05_02_patch_1030

## First error

`../../media/filters/audio_renderer_algorithm.cc:248:58: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'`

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GetPeriodicHanningWindow` was spanified, but the call site in `AudioRendererAlgorithm::PrimeOLAWindows` is passing a raw pointer (`ola_window_.get()`) instead of a span. The rewriter failed to recognize that `ola_window_.get()` returns a raw pointer and therefore it needs to construct a span.

## Solution
The rewriter should recognize the pattern where a raw pointer is passed to a spanified function and generate the necessary code to create a span from the pointer. The code at the call site `AudioRendererAlgorithm::PrimeOLAWindows` should be changed from:

```c++
internal::GetPeriodicHanningWindow(ola_window_size_, ola_window_.get());
```

to:

```c++
internal::GetPeriodicHanningWindow(ola_window_size_, base::span<float>(ola_window_.get(), ola_window_size_));
```
The rewriter needs to generate the `base::span<float>(ola_window_.get(), ola_window_size_)` part.

## Note
The second error message is similar to the first one, indicating the same issue at a different call site: `../../media/filters/audio_renderer_algorithm.cc:252:40: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'`