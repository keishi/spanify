# Build Failure Analysis: 2025_03_19_patch_572

## First error

../../services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc:61:5: error: no matching function for call to 'AtomicReaderMemcpy'

## Category
Pointer passed into spanified function parameter.

## Reason
The `AtomicReaderMemcpy` function was spanified, but the call site in `sensor_reading_shared_buffer_reader.cc` is passing a raw pointer for the `dest` parameter. The rewriter did not update the call site to create a `span` from the `result` variable.

## Solution
The rewriter should recognize that when calling a spanified function with a raw pointer, it should create a `span` object at the call site.

## Note
The original call site is:
```c++
device::OneWriterSeqLock::AtomicReaderMemcpy(result, &buffer->reading,
                                            size);
```
The first parameter `result` needs to be wrapped in a span.  It is possible the size information could be easily determined using `sizeof`, which should also be added to the fix.
```c++
device::OneWriterSeqLock::AtomicReaderMemcpy(base::span(result, sizeof(result)), &buffer->reading,
                                            size);