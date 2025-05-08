# Build Failure Analysis: 2025_05_02_patch_1491

## First error

```
../../base/profiler/stack_buffer.h:42:12: error: no viable conversion from returned value of type 'pointer' (aka 'unsigned long *') to function return type 'base::span<uintptr_t>' (aka 'span<unsigned long>')
   42 |     return buffer_.get();
      |            ^~~~~~~~~~~~~
```

## Category
Rewriter failed to add `.data()` to a spanified return value.

## Reason
The rewriter changed the return type of `StackBuffer::buffer()` to `base::span<uintptr_t>`. However, the original code returned `buffer_.get()` which is a raw pointer. The rewriter did not add `.data()` to the return value.

## Solution
The rewriter should add `.data()` to the return value of `StackBuffer::buffer()` so that the code compiles.
```
   base::span<uintptr_t> buffer() const {
     // Aligned during allocation.
-    return buffer_.get();
+    return base::span(buffer_.get(), size());
   }
```

## Note
Other changes in this patch involve calls to `.data()` and `.subspan()` on what is now a `base::span<...>`, which are correct.
```
reinterpret_cast<const uint8_t*>(stack_buffer.buffer().data()),

reinterpret_cast<const uintptr_t>(stack_copy_bottom).subspan(stack_size);