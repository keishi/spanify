# Build Failure Analysis: 2025_05_02_patch_263

## First error

```
../../services/network/public/cpp/cors/cors_unittest.cc:366:38: error: no member named 'subspan' in 'std::array<char, 84>'
  366 |     const auto* const end = kAllowed.subspan(std::size(kAllowed) - 1);
      |                             ~~~~~~~~ ^
```

## Category
Rewriter failed to apply subspan rewrite to a spanified return value.

## Reason
`kAllowed` was converted to `std::array`, and `std::array` does not have a `subspan` method. The correct usage here should be `kAllowed.data() + std::size(kAllowed) - 1`

## Solution
The rewriter needs to add `.data()` to a spanified return value when using `subspan`.

## Note
None