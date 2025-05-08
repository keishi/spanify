# Build Failure Analysis: 2025_05_02_patch_1077

## First error

```
../../services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc:61:5: error: no matching function for call to 'AtomicReaderMemcpy'
   61 |     device::OneWriterSeqLock::AtomicReaderMemcpy(result, &buffer->reading,
      |     ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../device/base/synchronization/one_writer_seqlock.h:76:24: note: candidate template ignored: could not match 'base::span<T>' against 'SensorReading *'
   76 | void OneWriterSeqLock::AtomicReaderMemcpy(base::span<T> dest,
      |                        ^
```

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `AtomicReaderMemcpy` function's first argument, but the call site in `SensorReadingSharedBufferReader::Read` is passing a raw pointer (`result`) to a `SensorReading` object.  The function now expects a `base::span<T>`, but it's receiving a `SensorReading*`.

## Solution
The rewriter needs to update the call site to pass a span.  Since `AtomicReaderMemcpy` is copying `size` elements from `src` to `dest`, we should construct a `base::span` with `size=1` at the call site, like this:

```c++
device::OneWriterSeqLock::AtomicReaderMemcpy(base::span<SensorReading>(result, 1), &buffer->reading,
                                           sizeof(SensorReading));
```

## Note
The size used in the original code `sizeof(SensorReading)` was suspicious. It was used as number of elements instead of byte size. I have corrected the size in the code above.