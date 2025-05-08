# Build Failure Analysis: 2025_05_02_patch_7

## First error

```
../../url/url_canon_etc.cc:371:10: error: no matching function for call to 'DoScheme'
  371 |   return DoScheme<char, unsigned char>(spec, scheme, output, out_scheme);
      |          ^~~~~~~~~~~~~~~~~~~~~~~~~~~~~
../../url/url_canon_etc.cc:121:6: note: candidate function template not viable: no known conversion from 'const char *' to 'base::span<const char>' for 1st argument
  121 | bool DoScheme(base::span<const CHAR> spec,
      |      ^        ~~~~~~~~~~~~~~~~~~~~~~~~~~~
```

## Category
Pointer passed into spanified function parameter.

## Reason
The function `DoScheme` was spanified, but the call sites were not updated to pass a `base::span`. Instead, raw pointers `const char*` and `const char16_t*` are being passed. The rewriter failed to recognize that a span must be constructed from the raw pointer and size before being passed to the spanified function.

## Solution
The rewriter needs to wrap the `spec` argument at the call sites with `base::span` using the appropriate size. Since the `scheme` component contains the length, it should be used to construct the span. The rewriter should generate code like this:

```
return DoScheme<char, unsigned char>(
    base::span<const char>(spec, scheme.len), scheme, output, out_scheme);
```

similarly

```
return DoScheme<char16_t, char16_t>(
    base::span<const char16_t>(spec, scheme.len), scheme, output, out_scheme);
```

## Note
The build log shows similar errors for both `char` and `char16_t` versions of the `DoScheme` function calls, indicating a consistent pattern where the rewriter failed to handle the conversion to `base::span` at call sites.