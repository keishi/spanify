# Build Failure Analysis: 2025_03_19_patch_1863

## First error

../../components/url_formatter/spoof_checks/skeleton_generator.cc:256:24: error: no viable conversion from 'char16_t *' to 'base::span<char16_t>'
  256 |   base::span<char16_t> buffer = host_alt.getBuffer(-1);
      |                        ^        ~~~~~~~~~~~~~~~~~~~~~~

## Category
Rewriter needs to generate code to construct a span from the return value of a third_party function.

## Reason
The code calls `host_alt.getBuffer(-1)` which is a third party code to get the underlying buffer as a `char16_t*`. Then the rewriter is assigning the raw pointer to the `base::span<char16_t>` directly, which is an invalid conversion. The rewriter needs to generate code to construct the span from the pointer and the known length. 

## Solution
The rewriter needs to wrap the result of `host_alt.getBuffer(-1)` in a `base::span` constructor, passing the length as well to construct a valid span:
```c++
base::span<char16_t> buffer(host_alt.getBuffer(-1), length);
```

## Note
Also in the error log:
1. The call to `base::span::subspan` is also invalid. It should be `subspan(0, length)` instead of `subspan(length)`.
2. The indexing uc[0] in line 259 doesn't work. When applying the fix, use uc[i] or *uc syntax instead.
3. The strict_cast error is because the `length` variable is being converted from `int` to `size_t`, which is not allowed. Change the type of `length` to `size_t` to fix this.
```c++
size_t length = host_alt.length();