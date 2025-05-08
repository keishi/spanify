# Build Failure: 2025_05_02_patch_1405

## First error

```
../../url/url_canon_host.cc:255:12: error: no matching function for call to 'DecodeEscaped'
  255 |       if (!DecodeEscaped(host, &i, host_len,
      |            ^~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The `DecodeEscaped` function in `url_canon_internal.h` was spanified, but the call sites in `url_canon_host.cc` were not updated to pass a `base::span`. Specifically, the `host` variable being passed is a `const CHAR*` (where CHAR is either `char16_t` or `char`), but the function now expects a `base::span<const CHAR>`.

## Solution
The rewriter needs to update the call sites of `DecodeEscaped` in `url_canon_host.cc` to pass a `base::span`. This involves creating a `base::span` from the pointer and size information available at the call site.  For example, in `DoSimpleHost` one could rewrite
`DecodeEscaped(host, &i, host_len, ...)` to `DecodeEscaped(base::span(host, host_len), &i, host_len, ...)`

## Note
The error occurs multiple times in `url_canon_host.cc` because the `DecodeEscaped` function is called in several places with different template instantiations.