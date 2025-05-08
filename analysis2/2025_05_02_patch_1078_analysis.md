# Build Failure Analysis: 2025_05_02_patch_1078

## First error

../../services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc:61:5: error: no matching function for call to 'AtomicReaderMemcpy'

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified the `AtomicReaderMemcpy` function, but failed to spanify the call site. The call site is passing a raw pointer `&buffer->reading` where the function is now expecting `base::span<const T> src`. This indicates that the rewriter didn't correctly propagate the span changes to all call sites of the spanified function.

## Solution
The rewriter needs to spanify the call site of `AtomicReaderMemcpy` in `sensor_reading_shared_buffer_reader.cc`. In this particular case a simple solution is to create a span of the variable when calling the function.
```c++
device::OneWriterSeqLock::AtomicReaderMemcpy(result, base::span(&buffer->reading, 1),
```
A more generic solution is to identify all call sites of `AtomicReaderMemcpy` function, and make sure they are spanified. If the function argument `&buffer->reading` is not spanified, create a span using the size `1`.

## Note