# Build Failure Analysis: 2025_05_02_patch_17

## First error

../../ui/events/devices/x11/device_data_manager_x11.cc:593:14: error: cannot increment value of type 'base::span<const x11::Input::Fp3232>'

## Category
Rewriter needs to avoid incrementing span directly.

## Reason
The original code incremented a pointer, but after converting to `base::span`, direct pointer arithmetic is no longer allowed. The error occurs because `valuators` is now a `base::span`, and `valuators++` attempts to increment the span itself, which is invalid.

## Solution
The rewriter should have replaced the pointer increment with an index-based access or subspan operation. Since the surrounding code iterates based on `valuator_count_[sourceid]`, the correct approach is to access the elements using an index, create a subspan, and increment the index in the loop.

Instead of doing
```cpp
valuators++;
```

do this:
```cpp
valuators = valuators.subspan(1);
```

## Note
None