# Build Failure Analysis: 2025_05_02_patch_261

## First error

../../services/network/public/cpp/cors/cors_unittest.cc:283:26: error: no member named 'subspan' in 'std::array<char, 70>'
  283 |     auto* end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                 ~~~~~~~~ ^

## Category
Rewriter needs to add .data() to arrayified `char[]` variable used with std::find.

## Reason
The rewriter converted `kAllowed` from a `char[]` to `std::array<char, 70>`. Then the rewriter attempted to use `.subspan()` on the std::array, but assigned the return to a `char*`. This doesn't work because `.subspan()` returns a `base::span`.

The real issue is that `std::find` expects a `char*` as the second argument. The fix is to call `.data()` on `kAllowed` to get a pointer to the underlying data, and pass that pointer to `std::find`.

## Solution
The rewriter should replace `.subspan(std::size(kAllowed) - 1)` with `.data() + std::size(kAllowed) - 1`.

```c++
-   auto* end = kAllowed.subspan(std::size(kAllowed) - 1);
+   auto* end = kAllowed.data() + std::size(kAllowed) - 1;
```

## Note
There is no need to use `.subspan()` in this case. The variable `end` is of type `char*`, so it needs to be a raw pointer, not a span.