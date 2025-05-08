# Build Failure Analysis: 2025_05_02_patch_601

## First error

```
../../net/disk_cache/blockfile/stats.cc:54:12: error: member reference type 'base::span<OnDiskStats>' is not a pointer; did you mean to use '.'?
   54 |   if (stats->signature != kDiskSignature)
      |       ~~~~~^~
      |            .
```

## Category
Rewriter needs to handle address of a spanified variable passed into a function.

## Reason
The rewriter converted `OnDiskStats* stats` to `base::span<OnDiskStats> stats` in the `VerifyStats` function. However, the code inside `VerifyStats` still uses pointer syntax (e.g., `stats->signature`). `base::span` is not a pointer, so the correct syntax is to use the dot operator (e.g., `stats.signature`).

## Solution
The rewriter needs to change the pointer `->` to dot `.` when accessing member variables in `VerifyStats` function. Also, rewriter should check that the `stats` variable itself is not assigned. The rewriter also needs to call `.data()` on the span to pass the raw pointer to functions like `memset` and `memcpy`.

## Note
The build log shows many errors because the rewriter failed to update the syntax when spanifying the `stats` variable.