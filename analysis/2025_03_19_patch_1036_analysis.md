# Build Failure Analysis: 2025_03_19_patch_1036

## First error

../../mojo/public/cpp/system/tests/invitation_unittest.cc:321:25: error: no matching conversion for functional-style cast from 'ScopedMessagePipeHandle *' (aka 'ScopedHandleBase<MessagePipeHandle> *') to 'base::span<ScopedMessagePipeHandle, 1>' (aka 'span<ScopedHandleBase<MessagePipeHandle>, 1>')

## Category
Rewriter failing to recognize raw pointer passed to spanified function.

## Reason
The function LaunchChildTestClient was spanified to take base::span as an argument. However, the call sites pass the address of a ScopedMessagePipeHandle. Since `base::span` is not implicitly constructible from a raw pointer, a conversion is needed to construct the span from the raw pointer using size information:

```c++
-  LaunchChildTestClient("CppSendClient", &pipe, 1, InvitationType::kNormal,
+  LaunchChildTestClient("CppSendClient",
+                        base::span<ScopedMessagePipeHandle, 1>(&pipe), 1,
```

The rewriter failing to recognize raw pointer passed to spanified function. The rewriter needs to be able to recognize when a raw pointer (with size info unavailable) is passed to a function, so it can rewrite it.

## Solution
The rewriter needs to be updated to properly handle call sites that pass the address of a ScopedMessagePipeHandle to a function expecting a base::span. The rewriter needs to wrap the `&pipe` with `base::span<ScopedMessagePipeHandle, 1>(...)`.

```c++
  LaunchChildTestClient("CppSendClient",
                        base::span<ScopedMessagePipeHandle, 1>(&pipe), 1,
                        InvitationType::kNormal, GetParam());
```

## Note
Similar errors will likely occur in other call sites within this file. The rewriter should be able to fix all.
```
../../mojo/public/cpp/system/tests/invitation_unittest.cc:336:25: error: no matching conversion for functional-style cast from 'ScopedMessagePipeHandle *' (aka 'ScopedHandleBase<MessagePipeHandle> *') to 'base::span<ScopedMessagePipeHandle, 1>' (aka 'span<ScopedHandleBase<MessagePipeHandle>, 1>')
../../mojo/public/cpp/system/tests/invitation_unittest.cc:415:33: error: no matching conversion for functional-style cast from 'ScopedMessagePipeHandle *' (aka 'ScopedHandleBase<MessagePipeHandle> *') to 'base::span<ScopedMessagePipeHandle, 1>' (aka 'span<ScopedHandleBase<MessagePipeHandle>, 1>')