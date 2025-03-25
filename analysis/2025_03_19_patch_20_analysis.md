# Build Failure Analysis: 2025_03_19_patch_20

## First error

../../net/ntlm/ntlm_unittest.cc:393:63: error: invalid operands to binary expression ('const array<remove_cv_t<unsigned char>, 90UL>' (aka 'const array<unsigned char, 90UL>') and 'const size_t' (aka 'const unsigned long'))

## Category
Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Reason
The rewriter is trying to rewrite `kExpectedTargetInfoSpecResponseV2 + kMissingServerPairsLength` where `kExpectedTargetInfoSpecResponseV2` is an `std::array`. But `kMissingServerPairsLength` is a `constexpr` and these guys are not compatible.

## Solution
The rewriter should not attempt to spanify any file that has some files it should exclude. Rewriter needs to avoid spanifying functions if it requires spanifying excluded code.

## Note
kExpectedTargetInfoSpecResponseV2 was turned into std::array and kMissingServerPairsLength is an inline constexpr. Thus they don't have a compatible `operator+`.

```c++
constexpr uint16_t kMissingServerPairsLength = 8;