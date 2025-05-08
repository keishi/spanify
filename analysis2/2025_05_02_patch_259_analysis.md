# Build Failure Analysis: 2025_05_02_patch_259

## First error

../../components/gwp_asan/client/sampling_malloc_shims_unittest.cc:227:31: error: no viable conversion from 'unsigned char *' to 'base::span<unsigned char>'

## Category
Rewriter needs to generate code to construct a span from the return value of `calloc`

## Reason
The code is assigning the raw pointer return value of `calloc` directly to a `base::span`. `base::span` has no implicit constructor that accepts a raw pointer. It needs to be explicitly constructed using the pointer and size.

## Solution
The rewriter needs to generate code to explicitly construct the `base::span` from the raw pointer returned by `calloc` and the allocated size.

```c++
-   base::span<unsigned char> alloc =
-       static_cast<unsigned char*>(calloc(base::GetPageSize(), 1));
+   unsigned char* alloc_ptr = static_cast<unsigned char*>(calloc(base::GetPageSize(), 1));
+   base::span<unsigned char> alloc(alloc_ptr, base::GetPageSize());
```
## Note
The error `invalid operands to binary expression ('const base::span<unsigned char>' and 'const std::nullptr_t')` happens because comparing a span to nullptr is not allowed. The correct solution is to check `alloc_ptr == nullptr` before `base::span<unsigned char> alloc(alloc_ptr, base::GetPageSize());`

The error `no viable conversion from 'base::span<unsigned char>' to 'const void *'` happens because `PointerIsMine` only accepts a `void*`. The rewriter should convert `alloc` to `alloc.data()` for third-party calls.
```c++
     if (GetMallocGpaForTesting().PointerIsMine(alloc.data())) {