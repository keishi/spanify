# Build Failure Analysis: 2025_03_19_patch_501

## First error

../../base/numerics/safe_conversions.h:271:47: error: no matching function for call to 'strict_cast'

## Category
Rewriter needs to cast argument to base::span::subspan() to an unsigned value.

## Reason
The rewriter created the following code:

```c++
new FakeDesktopMediaPicker(test_flags_.subspan(current_test_ - 1).data());
```

Since current_test_ is of type int, but subspan requires an unsigned integer, a cast from `int` to `size_t` is required. The correct code is:

```c++
new FakeDesktopMediaPicker(test_flags_.subspan(static_cast<size_t>(current_test_ - 1)).data());
```

## Solution
The rewriter needs to static_cast to `size_t`.

## Note
It is also important to keep in mind that the number of tests is fixed at compile time in the unittest, so span<TestFlags> test_flags can be arrayified.