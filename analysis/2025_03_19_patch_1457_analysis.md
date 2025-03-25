# Build Failure Analysis: 2025_03_19_patch_1457

## First error

```
../../content/browser/service_worker/service_worker_consts.h:69:3: error: non-static data member cannot be constexpr; did you intend to make it static?
   69 |   constexpr std::array<char, 51> kServiceWorkerUnregisterErrorPrefix{
      |   ^
      |   static 
```

## Category
Rewriter dropped mutable qualifier.

## Reason
The rewriter converted a `char[]` to `std::array`. However, the original `char[]` was a non-static data member, which means it could be `mutable`. The rewriter dropped this qualifier.

## Solution
The rewriter needs to preserve the `mutable` qualifier when converting a `char[]` to `std::array` for non-static data members.
```c++
  mutable constexpr std::array<char, 51> kServiceWorkerUnregisterErrorPrefix{
      "Failed to unregister a ServiceWorkerRegistration: "};
```

## Note
The build log indicates that the error is a compiler error and not a conflict due to replacements overlapping.