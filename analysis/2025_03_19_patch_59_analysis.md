```
# Build Failure Analysis: 1651_03_19_patch_59

## First error

../../base/threading/thread_local_storage.cc:523:32: error: no matching function for call to 'GetTlsVectorStateAndValue'
  523 |   const TlsVectorState state = GetTlsVectorStateAndValue(
      |                                ^~~~~~~~~~~~~~~~~~~~~~~~~
../../base/threading/thread_local_storage.cc:218:16: note: candidate function not viable: no known conversion from 'base::span<TlsVectorEntry> *' to 'TlsVectorEntry **' for 2nd argument
  218 | TlsVectorState GetTlsVectorStateAndValue(PlatformThreadLocalStorage::TLSKey key,
      |                ^
  219 |                                          TlsVectorEntry** entry = nullptr) {
      |                                          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../base/threading/thread_local_storage.cc:207:16: note: candidate function not viable: no known conversion from 'unsigned int' to 'void *' for 1st argument
  207 | TlsVectorState GetTlsVectorStateAndValue(void* tls_value,
      |                ^                         ~~~~~~~~~~~~~~~

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter attempted to spanify the `tls_data` variable but failed to properly handle its usage in the `GetTlsVectorStateAndValue` function call. The function expects a `TlsVectorEntry**`, but the rewriter is passing a `base::span<TlsVectorEntry>*`.

## Solution
The rewriter needs to recognize that the spanified variable `tls_data` is being passed as an output parameter. Therefore, it needs to create a temporary variable of the correct type, pass the address of the temporary variable to the function, and then assign the contents of the temporary variable to the first element of the span after the function call.

```c++
  base::span<TlsVectorEntry> tls_data = {};
+  TlsVectorEntry* temp_tls_data = nullptr;
   const TlsVectorState state = GetTlsVectorStateAndValue(
-      g_native_tls_key.load(std::memory_order_relaxed), &tls_data);
+      g_native_tls_key.load(std::memory_order_relaxed), &temp_tls_data);
   DCHECK_NE(state, TlsVectorState::kDestroyed);
-  if (!tls_data) {
+  if (temp_tls_data == nullptr) {
     return nullptr;
   }
+  tls_data[0] = *temp_tls_data;
   DCHECK_LT(slot_, kThreadLocalStorageSize);
```

## Note
The other errors are caused by this.