```
# Build Failure Analysis: 2025_03_15_patch_903

## First error

../../media/filters/audio_renderer_algorithm.cc:248:58: error: no viable conversion from 'pointer' (aka 'float *') to 'base::span<float>'

## Category
Rewriter needs to generate code to construct a span from the raw pointer variable used in function call.

## Reason
The code passes a raw pointer `ola_window_.get()` where a `base::span<float>` is expected, but the rewriter does not automatically generate code to construct the `base::span<float>` from the raw pointer.

## Solution
The rewriter should wrap `ola_window_.get()` to construct a span from the raw pointer and window size.
1. Identify all the constructor calls where a `base::span` variable is constructed from an argument that has a raw pointer.
2. Wrap the raw pointer by the right base::span constructor.

For example, the following is the original code:

```c++
    internal::GetPeriodicHanningWindow(ola_window_size_, ola_window_.get());
```

The rewriter should replace this with:

```c++
    internal::GetPeriodicHanningWindow(ola_window_size_, base::span<float>(ola_window_.get(), ola_window_size_));
```

## Note
There are no extra errors.