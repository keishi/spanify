# Build Failure Analysis: 2025_05_02_patch_300

## First error

../../mojo/public/cpp/bindings/lib/array_internal.h:542:12: error: no viable conversion from returned value of type 'StorageType *' (aka 'char *') to function return type 'base::span<StorageType>' (aka 'span<char>')

## Category
Rewriter needs to use `base::span` to construct a `base::span` instead of directly returning the pointer.

## Reason
The rewriter changed the return type of `Array_Data::storage()` from `StorageType*` to `base::span<StorageType>`. However, the implementation still returns a raw pointer `reinterpret_cast<StorageType*>(...)`. There is no implicit conversion from raw pointer to `base::span`. The rewriter should construct a `base::span` from the raw pointer and the size.

## Solution
In `Array_Data::storage()`, construct a `base::span` with the underlying pointer and the number of elements. The correct implementation should be:
```c++
  base::span<StorageType> storage() {
    return base::span<StorageType>(
        reinterpret_cast<StorageType*>(reinterpret_cast<char*>(this) +
                                          sizeof(*this)),
        header_.num_elements);
  }
```

## Note
There are other errors that can be classified into the following categories.

*   Rewriter added `.data()` to a variable/member it did not spanify/arrayify.
*   Rewriter failed to add `.data()` to a spanified return value.