# Build Failure Analysis: 2025_05_02_patch_81

## First error

../../base/threading/thread_local_storage.cc:317:30: error: no viable conversion from 'TlsVectorEntry *' to 'base::span<TlsVectorEntry>'

## Category
Rewriter does not handle assignment of spanified variable from an allocation using new.

## Reason
The rewriter attempts to rewrite `TlsVectorEntry* tls_data` to `base::span<TlsVectorEntry> tls_data`, however it then fails in the line
`base::span<TlsVectorEntry> tls_data = new TlsVectorEntry[kThreadLocalStorageSize];` because a `new` operator is returning a raw pointer which isn't implicitly convertible to the new span type.

## Solution
The rewriter should not attempt to spanify variables that are assigned to results of `new`. Instead these code locations should likely use owned types such as `unique_ptr` or collection types such as `std::vector`.

## Note
The second error `no matching function for call to 'GetTlsVectorStateAndValue'` is a follow-on error. This happened because the code was changed from `TlsVectorEntry* tls_data` to `base::span<TlsVectorEntry> tls_data` but the function `GetTlsVectorStateAndValue` still expects a `TlsVectorEntry**` as input.