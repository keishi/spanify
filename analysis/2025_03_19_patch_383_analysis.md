# Build Failure Analysis: 2025_03_19_patch_383

## First error

../../mojo/core/ipcz_driver/mojo_message.cc:324:21: error: cannot initialize a member subobject of type 'IpczApplicationObjectSerializer' (aka 'int (*)(unsigned long, unsigned int, const void *, volatile void *, unsigned long *, unsigned long *, unsigned long *)') with an rvalue of type 'IpczResult (*)(uintptr_t, uint32_t, const void *, volatile void *, size_t *, base::span<IpczHandle>, size_t *)' (aka 'int (*)(unsigned long, unsigned int, const void *, volatile void *, unsigned long *, span<unsigned long>, unsigned long *)'): type mismatch at 6th parameter ('IpczHandle *' (aka 'unsigned long *') vs 'base::span<IpczHandle>' (aka 'span<unsigned long>'))
  324 |       .serializer = &SerializeForIpcz,
      |                     ^~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The error arises because the signature of the `SerializeForIpcz` function, which the rewriter has modified to accept a `base::span<IpczHandle>` argument, is incompatible with the type expected by the `IpczApplicationObjectSerializer`. The `IpczApplicationObjectSerializer` expects a function pointer that takes a raw `IpczHandle*` (which is an `unsigned long*`) but instead is receiving the address of a spanified function. The rewriter has failed to update the function pointer type `IpczApplicationObjectSerializer` to match the spanified function.

## Solution
The rewriter needs to also update the type of `IpczApplicationObjectSerializer` to accept a `base::span<IpczHandle>` rather than a raw pointer. This may involve changing the definition of `IpczApplicationObjectSerializer` or generating a wrapper function that adapts the span-based function to the raw pointer-based interface.

## Note
The code attempts to assign the address of `SerializeForIpcz` (spanified) to the `serializer` member, but it has the type `IpczApplicationObjectSerializer` which is an alias for a function pointer that expects a raw `IpczHandle*`. This is a case of incomplete spanification. The rewriter converted the function signature, but didn't update related data structures that uses that signature.