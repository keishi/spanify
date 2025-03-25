# Build Failure Analysis: 1610

## First error

../../gpu/command_buffer/common/common_cmd_format.h:41:28: error: cannot cast from type 'base::span<int32_t, 1>' (aka 'span<int, 1>') to pointer type 'void *'

## Category
Rewriter failed to add .data() to a spanified return value.

## Reason
The rewriter spanified the return value of `GetData()` but failed to add `.data()` when it is being cast to `void*`.

## Solution
The rewriter needs to add `.data()` to the spanified return value so that `static_cast<void*>(result->GetData())` becomes `static_cast<void*>(result->GetData().data())`.

## Note
There are other instances where `.data()` was not added in the diff.