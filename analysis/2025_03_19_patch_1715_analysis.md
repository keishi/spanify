# Build Failure Analysis: 2025_03_19_patch_1715

## First error

../../content/browser/service_worker/service_worker_consts.h:72:3: error: non-static data member cannot be constexpr; did you intend to make it static?
   72 |   constexpr std::array<char, 44> kServiceWorkerGetRegistrationErrorPrefix{

## Category
Rewriter dropped mutable qualifier.

## Reason
The compiler is complaining because the `kServiceWorkerGetRegistrationErrorPrefix` member was made `constexpr` but is non-static. This implies that the original code probably had a `mutable` qualifier which was dropped by the rewriter, leading to this compile error.

## Solution
The rewriter should preserve the `mutable` qualifier when converting from a `char[]` to `std::array` inside a class declaration. This will allow the array to be modified within const methods of the class. In the code, if a `char[]` is mutable, the rewriter should generate `mutable std::array<char, SIZE>`.

## Note
No other errors were found.