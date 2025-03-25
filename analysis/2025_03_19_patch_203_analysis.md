# Build Failure Analysis: 2025_03_19_patch_203

## First error

../../mojo/core/test/test_support_impl.cc:83:21: error: no viable conversion from 'char **' to 'base::span<char *>'

## Category
Rewriter needs to avoid static_cast on pointer variable used to initialize spanified variable.

## Reason
The rewriter introduced a static_cast to initialize a `base::span<char*>` variable with a `char**` expression. However, `base::span` doesn't have a constructor that accepts `char**`. The original code was directly assigning `calloc`'s return value (which is a `void*`) to a `char**` variable, which is a valid implicit conversion in C++. By introducing the static_cast and then trying to initialize a span with the result, the rewriter broke the implicit conversion chain.

## Solution
The rewriter should avoid the `static_cast` since `base::span` can be constructed directly from `void*` when the element type is `char*`. Alternatively, the span should be initialized using pointers and size like this: `base::span<char*>(static_cast<char*>(calloc(names.size() + 1, sizeof(char*))), names.size() + 1)`

## Note
This looks very similar to "Rewriter needs to avoid static_cast on pointer variable".