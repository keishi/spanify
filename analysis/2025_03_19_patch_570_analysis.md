# Build Failure Analysis: 2025_03_19_patch_570

## First error

../../services/device/generic_sensor/platform_sensor.cc:186:3: error: no matching function for call to 'AtomicWriterMemcpy'

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function `OneWriterSeqLock::AtomicWriterMemcpy` was spanified. The rewriter expected `&reading_buffer_->reading` to have size information available, but it did not have it. This seems to be a bug with the rewriter where it failed to recognize a size info unavailable rhs value.

## Solution
The rewriter needs to correctly identify when the size of an argument being passed into a spanified function is not available and insert code to get the size.

## Note
The error message indicates that the compiler couldn't find a matching function call to `AtomicWriterMemcpy`. The function signature was changed to accept a `base::span<const T>`, but the call site is still passing a raw pointer `(T*)`, without size information.
```c++
template <typename T>
-  static void AtomicWriterMemcpy(T* dest, const T* src, size_t size);
+  static void AtomicWriterMemcpy(T* dest, base::span<const T> src, size_t size);