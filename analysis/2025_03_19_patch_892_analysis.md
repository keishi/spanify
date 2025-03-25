```
# Build Failure Analysis: 2025_03_19_patch_892

## First error

../../sandbox/linux/syscall_broker/broker_process_unittest.cc:617:42: error: invalid operands to binary expression ('std::array<int, 4>' and 'int')
  617 |   SANDBOX_ASSERT(0 == pipe(available_fds + 2));

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter converted `available_fds` to a `std::array<int, 4>`, but the expression `available_fds + 2` is attempting pointer arithmetic on the `std::array`, which is invalid. The corrected code should use `available_fds.data() + 2` to get a pointer to the element at index 2. However, in this case, the `pipe` function cannot take a `span` or use pointer arithmetic. It only accepts raw pointers. Thus, we should not have spanified the code in the first place.

## Solution
The `pipe` function takes `int*` arguments. The rewriter needs to avoid spanifying functions if it requires spanifying code in the arguments of such function calls.

## Note
The rewriter also added `.data()` and `.subspan()` to the `available_fds` in the following code which are also incorrect:

```c++
1 + *std::max_element(available_fds.data(),
                            base::span<int>(available_fds)
                                .subspan(std::size(available_fds))
                                .data());
```

This can be fixed by replacing it with 
```c++
1 + *std::max_element(available_fds.data(), available_fds.data() + std::size(available_fds));
```
This code compiles because `std::max_element` can be used with iterators and not raw pointers which was the case in line 617 that lead to the error.