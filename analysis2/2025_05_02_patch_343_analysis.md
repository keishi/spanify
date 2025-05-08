# Build Failure Analysis: 2025_05_02_patch_343

## First error

`no matching function for call to 'UnicodeAppendUnsafe'`

## Category
Pointer passed into spanified function parameter.

## Reason
The rewriter spanified `UnicodeAppendUnsafe`, but failed to update the call sites where `UnicodeAppendUnsafe` is called. The function `DoUTFConversion` calls `UnicodeAppendUnsafe` with a `wchar_t*` as the first argument, but `UnicodeAppendUnsafe` now expects a `base::span<Char>`.

## Solution
The rewriter needs to update the call sites to pass a `base::span<Char>` to `UnicodeAppendUnsafe`. The code should be updated to:
```
UnicodeAppendUnsafe(base::span(dest, *size), size, code_point);
```

## Note
The concepts `BitsAre<Char, 8>` and `BitsAre<Char, 16>` prevent the original overload from compiling with `Char = wchar_t`.