# Build Failure Analysis: 2025_05_02_patch_1325

## First error

cannot cast from type 'base::span<int32_t, 1>' (aka 'span<int, 1>') to pointer type 'void *'

## Category
Rewriter failing to handle cast of single variable span.

## Reason
In `SizedResult::GetData`, the rewriter introduced a `base::span` for the `data` member. However, the code still attempts to cast this `base::span` to `void*`, which is not allowed.

## Solution
The rewriter needs to be able to properly cast to pointer type when spanifiying a variable or remove it completely.

In this case, instead of:

```c++
base::span<T> GetData() {
    return static_cast<T*>(
        static_cast<void*>(base::span<int32_t, 1>(&data, 1u)));
  }
```

It should have been:

```c++
base::span<T> GetData() {
    return base::span<T>(&data, 1u);
  }
```

## Note
Several other files also have the same issue.