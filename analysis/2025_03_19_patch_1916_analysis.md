# Build Failure Analysis: 2025_03_19_patch_1916

## First error

../../media/filters/audio_renderer_algorithm.cc:248:58: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'
  248 |     internal::GetPeriodicHanningWindow(ola_window_size_, ola_window_.get());
      |                                                          ^~~~~~~~~~~~~~~~~

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `GetPeriodicHanningWindow` was spanified, meaning the parameter `window` now expects a `base::span<float>`. However, the call site in `AudioRendererAlgorithm::DoProcess` passes `ola_window_.get()`, which returns a raw `float*` pointer. The rewriter has spanified a function, but failed to spanify a call site and it failed to recognize the pointer from `ola_window_.get()` as an appropriate argument to construct the `span`. The rewriter failed to recognize a size info unavailable rhs value.

## Solution
The rewriter should recognize this pattern and, at the call site, construct a `base::span` from the raw pointer and the known size. The corrected code should look like this:

```c++
internal::GetPeriodicHanningWindow(ola_window_size_, 
                                   base::span<float>(ola_window_.get(), ola_window_size_));
```
The rewriter should add this conversion.

## Note
The second error is the same as the first, just in a different location.