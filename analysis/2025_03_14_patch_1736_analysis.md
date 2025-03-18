# Build Failure Analysis: 2025_03_14_patch_1736

## First error

../../content/browser/service_worker/service_worker_consts.h:72:3: error: non-static data member cannot be constexpr; did you intend to make it static?
   72 |   constexpr std::array<char, 44> kServiceWorkerGetRegistrationErrorPrefix{
      |   ^
      |   static 

## Category
Rewriter needs to make `constexpr std::array` static.

## Reason
The rewriter transformed `kServiceWorkerGetRegistrationErrorPrefix` from a `constexpr char[]` to a `constexpr std::array<char, 44>`. However, in C++, `constexpr` variables at class scope must also be `static`. The rewriter failed to add the `static` keyword, causing a compilation error.

## Solution
The rewriter should add the `static` keyword when rewriting `constexpr char[]` variables at class scope to `constexpr std::array`.

## Note
The other errors are a result of the first error. Once the first error is fixed the remaining errors will disappear.