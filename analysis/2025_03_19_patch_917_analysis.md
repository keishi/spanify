```
# Build Failure Analysis: 2025_03_19_patch_917

## First error

../../base/functional/bind_internal.h:1603:21: error: static assertion failed: Type mismatch between bound argument and bound functor's parameter.

## Category
Rewriter needs to handle type mismatches when binding to spanified functions.

## Reason
The rewriter changed `ExpectedResultValue**` to `base::span<ExpectedResultValue*>` in the function signature for `BrokerSimpleMessageTestHelper::RecvMsgAndReply`. However, the `base::BindOnce` call sites were not updated to reflect the new signature. Specifically, `base::BindOnce` expects a `base::span<sandbox::syscall_broker::ExpectedResultValue *>`, but it is receiving a `sandbox::syscall_broker::ExpectedResultValue *(&)[1]`. The rewriter needs to update `base::BindOnce` parameters to take a span instead of an array, or add code to create the span.

## Solution
The rewriter needs to be able to update the `base::BindOnce` parameters to take a span instead of an array. Or, the rewriter needs to add code to create the span.

```c++
base::BindOnce(&BrokerSimpleMessageTestHelper::RecvMsgAndReply,
                        &ipc_reader, base::make_span(expected_results),
                        std::size(expected_results), reply_data1, -1));
```

## Note
Multiple `base::BindOnce` calls have the same error, and this pattern needs to be handled by the rewriter.