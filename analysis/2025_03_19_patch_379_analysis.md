# Build Failure Analysis: 2025_03_19_patch_379

## First error

../../base/metrics/persistent_memory_allocator_unittest.cc:626:19: error: no matching constructor for initialization of 'AllocatorThread'
  626 |   AllocatorThread t1("t1", memory, TEST_MEMORY_SIZE, TEST_MEMORY_PAGE);
      |                   ^  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/metrics/persistent_memory_allocator_unittest.cc:316:3: note: candidate constructor not viable: no known conversion from 'base::span<char>' to 'void *' for 2nd argument; take the address of the argument with &

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The code was changed to use `base::span<char> memory = mem_segment_;`, but the `AllocatorThread` constructor expects a `void* base`. The compiler is complaining because it cannot implicitly convert from `base::span<char>` to `void*`. The rewriter should have recognized that `memory` was spanified, and added `.data()` to the argument, so that it would pass the underlying pointer to the `AllocatorThread` constructor.

## Solution
The rewriter should have added `.data()` to the spanified variable `memory` when passing it to the `AllocatorThread` constructor. The correct code would be:
```c++
AllocatorThread t1("t1", memory.data(), TEST_MEMORY_SIZE, TEST_MEMORY_PAGE);
```
The rewriter should be updated to include `.data()` when a spanified variable is being passed as an argument to a function that expects a raw pointer.

## Note
The same error occurs multiple times in the build log.
```
../../base/metrics/persistent_memory_allocator_unittest.cc:627:19: error: no matching constructor for initialization of 'AllocatorThread'
../../base/metrics/persistent_memory_allocator_unittest.cc:628:19: error: no matching constructor for initialization of 'AllocatorThread'
../../base/metrics/persistent_memory_allocator_unittest.cc:629:19: error: no matching constructor for initialization of 'AllocatorThread'
../../base/metrics/persistent_memory_allocator_unittest.cc:630:19: error: no matching constructor for initialization of 'AllocatorThread'