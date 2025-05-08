# Build Failure Analysis: 2025_05_02_patch_898

## First error

```
../../cc/metrics/event_metrics.cc:430:58: error: invalid operands to binary expression ('const std::array<base::TimeTicks, static_cast<int>(DispatchStage::kMaxValue) + 1>' and 'size_t' (aka 'unsigned long'))
  430 |                         other.dispatch_stage_timestamps_ +
      |                         ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ ^
  431 |                             static_cast<size_t>(last_dispatch_stage) + 1,
      |                             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Rewriter needs to add .data() to arrayified variable used with std::copy.

## Reason
The code attempts to perform pointer arithmetic on `other.dispatch_stage_timestamps_`, which is now a `std::array`. The `std::copy` algorithm expects iterators (pointers) as arguments, but the expression `other.dispatch_stage_timestamps_ + static_cast<size_t>(last_dispatch_stage) + 1` tries to add an integer to the `std::array` itself, which is an invalid operation. The rewriter converted a C-style array to `std::array` but did not update the call to `std::copy` accordingly. `std::array` does not decay to a pointer like a C-style array.

## Solution
The rewriter needs to add `.data()` to the `other.dispatch_stage_timestamps_` to get a pointer to the underlying data. Similarly, `dispatch_stage_timestamps_` also needs `.data()`.

The corrected code should be:

```c++
UNSAFE_TODO(std::copy(other.dispatch_stage_timestamps_.data(),
                      other.dispatch_stage_timestamps_.data() +
                          static_cast<size_t>(last_dispatch_stage) + 1,
                      dispatch_stage_timestamps_.data()));
```

## Note
The rewriter introduced a second error: the destination argument to `std::copy` also needs to be spanified with `.data()`.
```
dispatch_stage_timestamps_.data()