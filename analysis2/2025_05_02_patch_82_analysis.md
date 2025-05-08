# Build Failure Analysis: 2025_05_02_patch_82

## First error

../../base/threading/thread_local_storage.cc:526:32: error: no matching function for call to 'GetTlsVectorStateAndValue'
  526 |   const TlsVectorState state = GetTlsVectorStateAndValue(
      |                                ^~~~~~~~~~~~~~~~~~~~~~~~~

## Category
Pointer passed into spanified function parameter.

## Reason
The function `GetTlsVectorStateAndValue` expects a `TlsVectorEntry**` as its second argument, but the rewriter spanified `tls_data` to `base::span<TlsVectorEntry>`. The span variable cannot be converted to a pointer to a pointer.  The tool spanified the variable `tls_data`, but failed to update the call site of `GetTlsVectorStateAndValue` to pass the underlying pointer of the span.

## Solution
The rewriter should use `tls_data.data()` to get a pointer from the span and pass it as a pointer to a pointer. This requires creating a temporary `TlsVectorEntry*` variable and assigning the pointer to it.

```c++
  TlsVectorEntry* tls_data_ptr = tls_data.data();
  const TlsVectorState state = GetTlsVectorStateAndValue(
      g_native_tls_key.load(std::memory_order_relaxed), &tls_data_ptr);
```

## Note