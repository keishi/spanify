# Build Failure Analysis: 2025_05_02_patch_229

## First error
../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.

## Category
Rewriter needs to handle passing arrays by address to base::BindOnce with spanified function.

## Reason
The error occurs because `base::BindOnce` is attempting to bind an argument of type `sandbox::syscall_broker::ExpectedResultValue *(&)[1]` (an array of pointers passed by reference) to a function parameter that now expects `base::span<sandbox::syscall_broker::ExpectedResultValue *>`. The rewriter changed the function signature to use `base::span`, but the `base::BindOnce` call site was not updated to pass a `base::span` directly.  `base::BindOnce` does not automatically convert the array to `base::span`.

## Solution
The rewriter needs to recognize when an array is passed by reference to `base::BindOnce` for a function whose corresponding parameter was spanified.  It should then rewrite the `base::BindOnce` call to explicitly construct a `base::span` from the array.

For example, the following code:

```c++
base::BindOnce(&BrokerSimpleMessageTestHelper::RecvMsgAndReply,
               &ipc_reader, expected_results,
               std::size(expected_results), reply_data1, -1)
```

Should be transformed into:

```c++
base::BindOnce(&BrokerSimpleMessageTestHelper::RecvMsgAndReply,
               &ipc_reader, base::span(expected_results, std::size(expected_results)),
               std::size(expected_results), reply_data1, -1)
```

This ensures that the `base::BindOnce` call passes the correct type to the spanified function.

## Note
The other errors are the same root cause.