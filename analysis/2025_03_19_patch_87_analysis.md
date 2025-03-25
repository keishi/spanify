# Build Failure Analysis: 2025_03_19_patch_87

## First error

../../base/check_op.h:229:26: error: invalid operands to binary expression ('const base::span<int>' and 'const std::nullptr_t')

## Category
Rewriter needs to nullptr initialization of spanified member field to {}.

## Reason
The rewriter changed `int* wire_fds = nullptr;` to `base::span<int> wire_fds = {};`.  The following DCHECK then compared `wire_fds` with `nullptr`. `base::span` does not have a comparison operator with `nullptr`.

## Solution
The rewriter should not have converted `int* wire_fds = nullptr;` to `base::span<int> wire_fds = {};`.  Instead it should have checked if the variable is null before calling `data()`.

The rewriter should avoid spanifying functions if it requires spanifying excluded code.

## Note
The second error is:

```
../../sandbox/linux/syscall_broker/broker_simple_message.cc:190:18: error: no viable overloaded '='
  190 |         wire_fds = reinterpret_cast<int*>(CMSG_DATA(cmsg));
      |         ~~~~~~~~ ^ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1045:19: note: candidate function not viable: no known conversion from 'int *' to 'const span<int>' for 1st argument
 1045 |   constexpr span& operator=(const span& other) noexcept = default;
      |                   ^         ~~~~~~~~~~~~~~~~~
../../base/containers/span.h:1046:19: note: candidate function not viable: no known conversion from 'int *' to 'span<int>' for 1st argument
 1046 |   constexpr span& operator=(span&& other) noexcept = default;
```

The rewriter spanified a variable but left a reinterpret_cast that is applied to it. Rewriter needs to be able to remove it. Rewriter also needs to generate code to construct a span from the return value of a third_party function.