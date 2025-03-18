# Build Failure Analysis: 2025_03_14_patch_194

## First error

../../components/url_formatter/spoof_checks/skeleton_generator.cc:256:24: error: no viable conversion from 'char16_t *' to 'base::span<char16_t>'

## Category
Rewriter needs to use .data() on results of getBuffer().

## Reason
The `icu::UnicodeString::getBuffer()` method returns a raw pointer (`char16_t*`). The rewriter attempts to assign this raw pointer directly to a `base::span<char16_t>`, which is not a valid conversion. The span needs to be constructed using the `.data()` method to access the underlying data.

## Solution
The rewriter needs to generate the correct code to construct the span using .data(). The corrected code would be:

```c++
base::span<char16_t> buffer = base::span(host_alt.getBuffer(-1), length);
```

This uses the constructor `base::span(pointer, size)` instead of attempting to directly assign the pointer.
Also consider constructing the span with .data() if available and applicable.

## Note
The second error is a consequence of the first. This failure would likely be resolved once a span is properly constructed.