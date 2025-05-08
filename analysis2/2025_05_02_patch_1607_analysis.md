# Build Failure Analysis: 2025_05_02_patch_1607

## First error

../../url/url_util.cc:417:7: error: no matching function for call to 'DoCanonicalize'

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoCanonicalize` was spanified, but the call sites were not updated to pass a `base::span`. The error message indicates that there is no matching function because the argument type doesn't match.  In this case, it expects a `base::span<const CHAR>` but receives a `char*`.

## Solution
The rewriter needs to update the call sites of `DoCanonicalize` to pass a `base::span`. It can construct a `base::span` from the pointer and length. For example:

```c++
// Original code
DoCanonicalize(temporary_output.data(), temporary_output.length(), ...);

// Rewritten code
DoCanonicalize(base::span<const char>(temporary_output.data(), temporary_output.length()), ...);
```

The call sites for other `DoCanonicalize` functions must also be updated to pass a `base::span`.

## Note
The error happens multiple times at different call sites of `DoCanonicalize`, which means it is likely a general bug.