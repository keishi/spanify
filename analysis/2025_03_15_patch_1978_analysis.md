```
# Build Failure Analysis: 2025_03_15_patch_1978

## First error

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
The spanify tool converted the OneWriterSeqLock::AtomicReaderMemcpy to use spans, but the call site in SensorReadingSharedBufferReader::Read() was not updated to pass a span. It is passing `result` as a raw pointer to the spanified function.

```c++
void SensorReadingSharedBufferReader::Read(SensorReading* result) {
  if (!buffer_)
    return;

  if (!sequence_checker_.CalledOnValidSequence()) {
    SafeMempcy(result, &buffer_->reading, sizeof(SensorReading));
    return;
  }
  device::OneWriterSeqLock::AtomicReaderMemcpy(result, &buffer_->reading,
                                             sizeof(SensorReading));
}
```

## Solution
The call site must be updated to pass a span. Use base::make_span with the `result` pointer and size.

```c++
--- a/services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc
+++ b/services/device/public/cpp/generic_sensor/sensor_reading_shared_buffer_reader.cc
@@ -58,8 +58,8 @@
     SafeMempcy(result, &buffer_->reading, sizeof(SensorReading));
     return;
   }
-  device::OneWriterSeqLock::AtomicReaderMemcpy(result, &buffer_->reading,
-                                             sizeof(SensorReading));
+  device::OneWriterSeqLock::AtomicReaderMemcpy(
+      base::make_span(result, sizeof(SensorReading)), &buffer_->reading,
+      sizeof(SensorReading));
 }

 }  // namespace device
```

## Note
The header file shows that the AtomicReaderMemcpy function takes `base::span<T> dest` so the `result` pointer must be converted to a `base::span<T>` using the `base::make_span` call.