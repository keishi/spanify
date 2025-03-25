# Build Failure Analysis: 2025_03_19_patch_478

## First error

../../media/parsers/vp8_parser.cc:731:8: error: use of undeclared identifier 'coeff_probs'

## Category
Rewriter needs to refer to the member via `curr_entropy_hdr_`.

## Reason
The rewriter replaced the original `uint8_t coeff_probs` array with `std::array coeff_probs`. The code incorrectly assumed that `coeff_probs` can be accessed directly. Since it is now a member of `curr_entropy_hdr_`, the code must access it through `curr_entropy_hdr_.coeff_probs`.

## Solution
The rewriter should access the member variable via `curr_entropy_hdr_.coeff_probs` instead of just `coeff_probs`. For example,

```c++
- sizeof(curr_entropy_hdr_.coeff_probs) == sizeof(kDefaultCoeffProbs)
+ (curr_entropy_hdr_.coeff_probs.size() * sizeof(decltype(curr_entropy_hdr_.coeff_probs)::value_type)) == sizeof(kDefaultCoeffProbs)
```

## Note
The same issue applies to other instances of accessing `coeff_probs` in `VP8Parser::ResetProbs()` and `VP8Parser::ParseTokenProbs()`.