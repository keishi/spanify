# Build Failure Analysis: 2025_05_02_patch_524

## First error

../../mojo/core/ipcz_driver/mojo_message.cc:323:21: error: cannot initialize a member subobject of type 'IpczApplicationObjectSerializer' (aka 'int (*)(unsigned long, unsigned int, const void *, volatile void *, unsigned long *, unsigned long *, unsigned long *)') with an rvalue of type 'IpczResult (*)(uintptr_t, uint32_t, const void *, volatile void *, size_t *, base::span<IpczHandle>, size_t *)' (aka 'int (*)(unsigned long, unsigned int, const void *, volatile void *, unsigned long *, span<unsigned long>, unsigned long *)'): type mismatch at 6th parameter ('IpczHandle *' (aka 'unsigned long *') vs 'base::span<IpczHandle>' (aka 'span<unsigned long>'))

## Category
Pointer passed into spanified function parameter.

## Reason
The function `SerializeForIpcz` is being assigned to a function pointer `serializer` that expects a raw pointer `IpczHandle*` as its sixth argument. However, the rewriter has changed the signature of `SerializeForIpcz` to take a `base::span<IpczHandle>` instead. The function pointer type is not compatible with the new signature, causing a type mismatch and a compilation error. The rewriter spanified a function, but failed to spanify a call site. The place where `SerializeForIpcz` is assigned to `serializer` is considered the call site.

## Solution
The rewriter must ensure that all uses of a function are updated when its signature is modified. In this case, it needs to either:

1.  **Spanify the `IpczApplicationObjectSerializer` function pointer type**: Update the definition of `IpczApplicationObjectSerializer` to accept a `base::span<IpczHandle>` as its sixth argument. This is the preferred solution if the intent is to consistently use spans.
2.  **Adapt the function pointer**: Generate code that adapts the `base::span<IpczHandle>` argument to an `IpczHandle*` when calling the function through the function pointer. This would involve extracting the underlying pointer from the span using `.data()`.

Because `IpczApplicationObjectSerializer` is likely third party code, option 2 is likely preferred. However, the spanified function in this case needs to not be spanified. The rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
None