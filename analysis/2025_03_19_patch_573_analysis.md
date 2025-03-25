# Build Failure Analysis: 2025_03_19_patch_573

## First error
../../services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc:61:5: error: no matching function for call to 'AtomicReaderMemcpy'
   61 |     device::OneWriterSeqLock::AtomicReaderMemcpy(result, &buffer->reading,

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified a function, but failed to spanify a call site. In `device/base/synchronization/one_writer_seqlock.h`, the function `AtomicReaderMemcpy` was spanified. However, in `services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc`, the call to `AtomicReaderMemcpy` passes `&buffer->reading`, which is a raw pointer. The error message "no matching function for call to 'AtomicReaderMemcpy'" indicates that the compiler could not find a version of `AtomicReaderMemcpy` that accepts a raw pointer as the second argument. The rewriter should recognize this situation and rewrite the call to pass a span.

## Solution
The rewriter should modify the call site to create a span from the raw pointer `&buffer->reading`. It would involve creating a `span` from the raw pointer and the size of the buffer.

## Note
The original code did not create the span properly.