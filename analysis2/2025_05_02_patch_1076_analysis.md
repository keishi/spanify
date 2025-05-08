# Build Failure Analysis: 2025_05_02_patch_1076

## First error

```
../../cc/metrics/shared_metrics_buffer.h:39:5: error: no matching function for call to 'AtomicWriterMemcpy'
   39 |     device::OneWriterSeqLock::AtomicWriterMemcpy(&data, &in, sizeof(T));
      |     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../cc/metrics/dropped_frame_counter.cc:374:27: note: in instantiation of member function 'cc::SharedMetricsBuffer<cc::UkmSmoothnessData>::Write' requested here
  374 |     ukm_smoothness_data_->Write(smoothness_data);
      |                           ^
../../device/base/synchronization/one_writer_seqlock.h:92:24: note: candidate template ignored: could not match 'base::span<const T>' against 'const cc::UkmSmoothnessData *'
   92 | void OneWriterSeqLock::AtomicWriterMemcpy(T* dest,
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `OneWriterSeqLock::AtomicWriterMemcpy` was spanified in the header file. The original `AtomicWriterMemcpy` took a `T* dest` and `const T* src` and now it takes `T* dest` and `base::span<const T> src`.

The error message indicates that the call to `AtomicWriterMemcpy` in `SharedMetricsBuffer::Write` is passing `&in` as the second argument, where `in` is of type `cc::UkmSmoothnessData`. This is a raw pointer, but `AtomicWriterMemcpy` now expects a `base::span<const T>`. The rewriter failed to spanify the call site, so the types no longer match.

## Solution
The rewriter needs to be modified to spanify the call site. This involves creating a `base::span` from `&in` before passing it to `AtomicWriterMemcpy`. Since the size is known via `sizeof(T)`, it can be addressed by changing `&in` to `base::span<const T>(&in, 1)`. The corrected code would look like this:
```c++
device::OneWriterSeqLock::AtomicWriterMemcpy(&data, base::span<const T>(&in, 1), sizeof(T));
```
This requires to add `#include "base/containers/span.h"` to `cc/metrics/shared_metrics_buffer.h`.

## Note
There are no other errors.